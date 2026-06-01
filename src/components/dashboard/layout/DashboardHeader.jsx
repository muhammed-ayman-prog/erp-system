import {
  CalendarDays,
  FileDown,
} from "lucide-react";

import {
  topBar,
  filter,
  exportBtns,
  btn,
} from "../dashboardStyles";
import { memo } from "react";
function DashboardHeader({

  t,

  range,

  setRange,

  exportPDF,

  exportExcel,

  data

}) {

  return (

    <>

      <div style={topBar}>

        <div style={filter}>

          <input

            type="date"

            value={range.start}

            onChange={(e) =>
              setRange({
                ...range,

                start:
                  e.target.value
              })
            }
          />

          <input

            type="date"

            value={range.end}

            onChange={(e) =>
              setRange({
                ...range,

                end:
                  e.target.value
              })
            }
          />

        </div>

        <div style={exportBtns}>

          <button
            style={btn}

            onClick={exportPDF}
          >

            {t("common.pdf")}

            <FileDown size={16}/>

          </button>

          <button
            style={btn}

            onClick={exportExcel}
          >

            {t("common.excel")}

            <FileDown size={16}/>

          </button>

        </div>

      </div>

    </>

  );
}

export default memo(
  DashboardHeader
);