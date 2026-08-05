export default function printInvoice() {
  const content = document.getElementById(
    "invoice-print"
  );

  if (!content) return;


  const win = window.open(
    "",
    "_blank",
    "width=900,height=700"
  );


  if (!win) return;



  win.document.write(`

<html>

<head>

<title>
Invoice
</title>


<style>

* {
  box-sizing:border-box;
}


html,
body {

  margin:0;

  padding:0;

  width:100%;

  min-height:100%;

  background:#fff !important;

  font-family:
    Arial,
    sans-serif;

}



body {

  direction:rtl;

}



.invoice-wrapper {

  width:100%;

  max-width:800px;

  margin:0 auto;

  padding:0;

  background:#fff !important;

}



.no-print {

  display:none !important;

}



button,
.dropdown,
.menu,
.popover,
[role="menu"] {

  display:none !important;

}



@page {

  size:A4;

  margin:10mm;

}



@media print {


  html,
  body {

    background:#fff !important;

  }


  .invoice-wrapper {

    width:100%;

  }


}


</style>


</head>


<body>


</body>


</html>

`);




  const clone =
    content.cloneNode(true);



  // remove unwanted UI

  clone
    .querySelectorAll(
      ".no-print, button, .dropdown, .menu, .popover, [role='menu']"
    )
    .forEach((el)=>{

      el.remove();

    });



  // clean wrapper

  clone.className =
    "invoice-wrapper";



  clone.style.background =
    "#fff";



  win.document.body.appendChild(
    clone
  );



  win.document.close();



  setTimeout(()=>{

    win.focus();

    win.print();

    win.close();

  },700);

}