import { jsPDF } from "jspdf";

import AmiriFont
from "./Amiri-Regular-normal";

jsPDF.API.events.push([

  "addFonts",

  function () {

    this.addFileToVFS(
      "Amiri-Regular.ttf",
      AmiriFont
    );

    this.addFont(
      "Amiri-Regular.ttf",
      "Amiri-Regular",
      "normal"
    );

  }

]);