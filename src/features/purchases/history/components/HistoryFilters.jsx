import { useRef } from "react";
import { Search, CalendarRange } from "lucide-react";
import { useTranslate } from "../../../../useTranslate";

export default function HistoryFilters({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {

  const { t } = useTranslate();


  const fromRef = useRef(null);
  const toRef = useRef(null);



  const openPicker = (ref) => {

    if (ref.current?.showPicker) {

      ref.current.showPicker();

    } else {

      ref.current?.focus();

    }

  };



  return (
    <div
      style={{
        background:"#fff",

        border:"1px solid #E5E7EB",

        borderRadius:16,

        padding:18,

        display:"flex",

        flexDirection:"column",

        gap:16,
      }}
    >


      {/* Search */}

      <div
        style={{
          display:"flex",

          alignItems:"center",

          gap:10,

          border:"1px solid #E5E7EB",

          borderRadius:12,

          padding:"0 14px",

          height:48,
        }}
      >

        <Search
          size={18}
          color="#64748B"
        />


        <input
          value={search}
          onChange={(e)=>
            setSearch(e.target.value)
          }

          placeholder={
            t("common.search")
          }

          style={{
            flex:1,

            border:"none",

            outline:"none",

            background:"transparent",

            fontSize:14,
          }}
        />

      </div>




      {/* Dates */}

      <div
        style={{
          display:"flex",

          gap:16,

          flexWrap:"wrap",
        }}
      >



        {/* From */}

        <div
          style={{
            flex:1,

            minWidth:220,

            display:"flex",

            flexDirection:"column",

            gap:6,
          }}
        >

          <label
            style={{
              fontSize:13,

              fontWeight:600,

              color:"#64748B",
            }}
          >
            {t("common.from")}
          </label>



          <div
            style={{
              display:"flex",

              alignItems:"center",

              gap:8,

              border:"1px solid #E5E7EB",

              borderRadius:12,

              padding:"0 12px",

              height:46,
            }}
          >

            <CalendarRange
              size={17}
              color="#64748B"
              style={{
                cursor:"pointer",
              }}
              onClick={() =>
                openPicker(fromRef)
              }
            />


            <input
              ref={fromRef}

              type="date"

              value={fromDate}

              onChange={(e)=>
                setFromDate(
                  e.target.value
                )
              }

              style={{
                flex:1,

                border:"none",

                outline:"none",

                background:"transparent",

                fontSize:14,
              }}
            />

          </div>

        </div>





        {/* To */}

        <div
          style={{
            flex:1,

            minWidth:220,

            display:"flex",

            flexDirection:"column",

            gap:6,
          }}
        >

          <label
            style={{
              fontSize:13,

              fontWeight:600,

              color:"#64748B",
            }}
          >
            {t("common.to")}
          </label>



          <div
            style={{
              display:"flex",

              alignItems:"center",

              gap:8,

              border:"1px solid #E5E7EB",

              borderRadius:12,

              padding:"0 12px",

              height:46,
            }}
          >

            <CalendarRange
              size={17}
              color="#64748B"
              style={{
                cursor:"pointer",
              }}
              onClick={() =>
                openPicker(toRef)
              }
            />


            <input
              ref={toRef}

              type="date"

              value={toDate}

              onChange={(e)=>
                setToDate(
                  e.target.value
                )
              }

              style={{
                flex:1,

                border:"none",

                outline:"none",

                background:"transparent",

                fontSize:14,
              }}
            />

          </div>

        </div>


      </div>




      {/* Hide Browser Icon */}

      <style>
        {`

          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity:0;
            cursor:pointer;
          }


          input[type="date"]::-webkit-inner-spin-button {
            display:none;
          }


        `}
      </style>


    </div>
  );
}