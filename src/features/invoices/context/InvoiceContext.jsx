import {
createContext,
useContext
} from "react";


const InvoiceContext =
createContext();


export function InvoiceProvider({
children,
value
}){

return (
<InvoiceContext.Provider value={value}>
{children}
</InvoiceContext.Provider>
);

}


export function useInvoiceContext(){

const context =
useContext(InvoiceContext);


if(!context){

throw new Error(
"useInvoiceContext must be used inside InvoiceProvider"
);

}


return context;

}