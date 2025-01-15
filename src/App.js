
import './App.css';
import { Upload } from 'lucide-react';
import { useEffect } from 'react';
import {motion} from 'framer-motion'
import { useState } from 'react';
import toast from 'react-hot-toast';
function App() {

  const [tableData, setTableData] = useState(null);
  const [tableRows, setTableRows] = useState(null);
  const [fileReaded, setFileReaded] = useState(false);
  const [errorExist, setErrorExist] = useState(false);
  const [fileName, setFileName] = useState('');
  const [emailIndex, setEmailIndex] = useState(-1);
  const [reportsToIndex, setReportsToIndex] = useState(-1);
  useEffect(()=>{

  },[]);

  function readFile(event){
    const file = event.target.files[0];
    setFileName(file.name);
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;
        parseCSV(fileContent);
        console.log('fileContent is ',fileContent);
        
      };

      reader.onerror = (err) => {
        console.error('Error reading file:', err);
      };

      reader.readAsText(file);
    }
  }

  function parseCSV(data){
    const rows = data.split('\n').map(row => row.trim());
    let tableRows=[];
    rows.forEach((row)=>{
      const rowSplitted=row.split(',');
      if (rowSplitted.length > 1 || (rowSplitted.length === 1 && rowSplitted[0] !== '')) {
        tableRows.push(rowSplitted);
      }   
    })
    setTableData(tableRows);
    toast.success('File readed sucess')
    setFileReaded(true);
  }


  function hasCycle(data) {
    if(emailIndex==-1 || reportsToIndex===-1){
      toast.error('First Validate the Data');
      return;
    }

    const graph = {};
    data.slice(1).forEach(row => {
        const email = row[emailIndex];
        const reportsTo = row[reportsToIndex];
        if (reportsTo) {
            const reportsList = reportsTo.split(';').map(email => email.trim());
            graph[email] = reportsList;
        }
    });

    const visited = new Set();
    const recStack = new Set();
   

    function dfs(node) {
        if (!graph[node]) return false; 
        if (recStack.has(node)) return true; 
        if (visited.has(node)) return false; 

        visited.add(node);
        recStack.add(node);

        for (const neighbor of graph[node]) {
            if (dfs(neighbor)) return true;
        }

        recStack.delete(node);
        return false;
    }

    for (const node in graph) {
        if (!visited.has(node)) {
            if (dfs(node)) {
              toast.error('Cycle Exist 😥')
             return true;}
        }
    }

    toast.success(`Cycle Don't Exist 😃`)
    return false;
}



  function validateData(){
    const validators=['Role','Email','ReportsTo'];
    let tableHeader = [...tableData[0]];
    let roleIndex=-1;
    let emailIndex=-1;
    let reportsToIndex=-1;
   
    tableHeader = tableHeader.map((el) => el.toLowerCase().trim());
    for(let i=0;i<validators.length;i++){
      const particularValidator=validators[i].toLowerCase().trim();
      const particularIndex=tableHeader.indexOf(particularValidator);
      if(particularIndex===-1){
        toast.error(`${particularValidator} is not included in CSV`)
        break;
      }
      if(i===0) roleIndex=particularIndex;
      else if(i===1) emailIndex=particularIndex;
      else if(i==2) reportsToIndex=particularIndex;
    }
    setEmailIndex(emailIndex);
    console.log('report inde xi s',reportsToIndex);
    
    setReportsToIndex(reportsToIndex);
    function findParentRole(givenEmail){
     return tableData.slice(1).find((row)=>{
         return row[emailIndex]==givenEmail
      });
    }

    const errors=[];
    tableData.slice(1).forEach((row)=>{
      const Role=row[roleIndex];
    
      const Email=row[emailIndex];
      const parentEmail=row[reportsToIndex];
      const parent=findParentRole(parentEmail);
      const ReportsTo=row[reportsToIndex];
      if(Email==='akash@example.com'){
        console.log('Role is ',parent);
      }
      let error='';
      switch (Role) {
        case 'Root':
          if (ReportsTo !== '') {
            error=`${Email} (Root) cannot report to anyone.`;
          }
          break;
  
        case 'Admin':
          if (parent && parent[roleIndex] !== 'Root') {
            error=(`${Email} (Admin) must report to a Root.`);
          }
          break;
  
        case 'Manager':
          if (!parent || (parent[roleIndex] !== 'Admin' && parent[roleIndex] !== 'Manager')) {
            error=(
              `${Email} (Manager) must report to an Admin or another Manager.`
            );
          }
          break;
  
        case 'Caller':
          if (!parent || parent[roleIndex] !== 'Manager') {
            error=(
              `${Email} (Caller) must report to a Manager (not Admin, Root, or another Caller).`
            );
          }
          break;
  
        default:
          error='';
          break;
      }

      errors.push(error);
    })

    let errorExist= errors.some((error)=>error!=='');
    if (errorExist) {
      setErrorExist(errorExist);
      setTableData((prev) => {
        const newData = [...prev];
        newData[0].push('errors');
        errors.forEach((error, index) => {
          newData[index + 1].push(error);
        })
        return newData;
      })
    }

    toast.success('Validation Completed')
  }

  return (
       <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h1 className="text-3xl  font-bold text-center mb-8 text-indigo-700">CSV File Uploader</h1>

          <div  className='border cursor-pointer  transition-all hover:scale-105 hover:bg-indigo-50  flex-col gap-3  flex justify-center items-center rounded-lg border-dotted border-indigo-700'>
          {
           ( fileReaded && fileName) ?
           <span className='text-indigo-700 p-8'>{fileName}</span>
           :
           <>
           <label htmlFor='file' className='flex cursor-pointer p-8 w-full justify-center items-center flex-col gap-3'>

           <Upload className='text-indigo-700 h-10 w-10' />
           <span className='text-indigo-700'>
             Drag and drop a CSV file here, or click to select a file
           </span>
         </label>
         <input type='file' id='file' onChange={readFile} className='hidden' accept='.csv'></input>
         </>
        
          }
          </div>

        
        </div>


        
        {tableData?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="border-t border-gray-200 p-8"
          >
            <div className='flex mb-2  items-center justify-between'>
            <h2 className="text-2xl font-semibold  text-indigo-700">CSV Data</h2>
            <button className='text-indigo-700 bg-indigo-100 p-2 rounded-md' onClick={validateData}>Validate </button>
            <button className='text-indigo-700 bg-indigo-100 p-2 rounded-md' onClick={()=>{
              hasCycle(tableData);
              
             }}>Detect cylce</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    {tableData[0].map((header, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.slice(1).map((row, rowIndex) => (
                    <motion.tr
                      key={rowIndex}
                      initial={{ opacity: 0, }}
                      animate={{ opacity: 1, }}
                      className={` ${errorExist && row[row.length-1]!=='' ?'bg-red-400 text-white':'text-gray-500'}`}
                    >


                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={`px-6 py-4 whitespace-nowrap text-sm `}>
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) :

        <>
        {fileReaded && 
        
        <h2 className='p-8  text-indigo-700 text-center'>
          No Data Found
        </h2>
        }
        </>

        }

        {/* <AnimatePresence>
       
        </AnimatePresence> */}
      </motion.div>



    </div>
  );
}

export default App;
