export function formatInvoiceDate(value){

if(!value?.seconds)
return "-";


return new Date(
value.seconds * 1000
)
.toLocaleDateString();

}



export function formatInvoiceDateTime(value){

if(!value?.seconds)
return "-";


return new Date(
value.seconds * 1000
)
.toLocaleString();

}