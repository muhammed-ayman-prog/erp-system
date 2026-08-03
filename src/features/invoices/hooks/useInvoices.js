import {
useEffect,
useState
} from "react";

import {
subscribeInvoices
} from "../services/invoiceService";


export default function useInvoices({

branchId,
allBranches=false

}){


const [
invoices,
setInvoices
]=useState([]);


const [
loading,
setLoading
]=useState(true);



useEffect(()=>{


if(!branchId && !allBranches)
return;



const unsub =
subscribeInvoices({

branchId,

allBranches,

callback:(data)=>{

setInvoices(data);

setLoading(false);

}

});


return ()=>unsub();


},[
branchId,
allBranches
]);



return {
  invoices,
  loading,
  setInvoices
};


}