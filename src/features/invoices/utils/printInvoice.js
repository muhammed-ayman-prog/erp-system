export default function printInvoice() {
  const content = document.getElementById("invoice-print");

  if (!content) return;

  const win = window.open(
    "",
    "_blank",
    "width=800,height=600"
  );

  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Invoice</title>

        <style>
          body{
            font-family: Arial;
            padding:20px;
          }

          button{
            display:none !important;
          }
        </style>
      </head>

      <body></body>
    </html>
  `);

  const clone = content.cloneNode(true);

  win.document.body.appendChild(clone);

  setTimeout(() => {
    win.print();
    win.close();
  }, 500);

  win.document.close();
}