import {
  Home,
  ShoppingCart,
  Boxes,
  BarChart3,
  Users,
  Receipt,
  RefreshCw,
  DollarSign,
  Building2,
  FileText,
  Repeat,
  PackagePlus,
  Trash2,
  Users2,
  BadgeDollarSign,
  CalendarDays
} from "lucide-react";

import {
  PERMISSIONS
} from "../constants/permissions";

export const NAVIGATION_ITEMS = [

  // ======================================================
  // MAIN
  // ======================================================

  {
    section: "sidebar.main",

    items: [

      {
        label:
          "sidebar.dashboard",

        path:
          "/dashboard",

        icon:
          Home
      },

      {
        label:
          "sidebar.sales",

        path:
          "/sales",

        icon:
          ShoppingCart,

        permission:
          PERMISSIONS.SALES_CREATE
      }

    ]
  },

  // ======================================================
  // OPERATIONS
  // ======================================================

  {
    section:
      "sidebar.operations",

    items: [

      {
        label:
          "sidebar.expenses",

        path:
          "/expenses",

        icon:
          Receipt,

        permission:
          PERMISSIONS.EXPENSES_VIEW
      },

      {
        label:
          "sidebar.returns",

        path:
          "/returns",

        icon:
          RefreshCw,

        permission:
          PERMISSIONS.RETURNS_VIEW
      },

      {
        label:
          "sidebar.inventory",

        path:
          "/inventory",

        icon:
          Boxes,

        permission:
          PERMISSIONS.INVENTORY_VIEW
      },

      {
        label:
          "sidebar.purchases",

        path:
          "/purchases",

        icon:
          PackagePlus,

        permission:
          PERMISSIONS.INVENTORY_VIEW
      },

      {
        label:
          "sidebar.operationsPage",

        path:
          "/operations",

        icon:
          Repeat,

        permission:
          PERMISSIONS.OPERATIONS_VIEW
      },

      {
        label:
          "sidebar.waste",

        path:
          "/waste",

        icon:
          Trash2,

        permission:
          PERMISSIONS.INVENTORY_ADJUST
      }

    ]
  },

  // ======================================================
  // FINANCE
  // ======================================================

  {
    section:
      "sidebar.finance",

    items: [

      {
        label:
          "sidebar.dailyClosing",

        path:
          "/daily-closing",

        icon:
          BadgeDollarSign,

        permission:
          PERMISSIONS.REPORTS_VIEW
      },

      {
        label:
          "sidebar.dailyClosingHistory",

        path:
          "/daily-closing-history",

        icon:
          CalendarDays,

        permission:
          PERMISSIONS.REPORTS_VIEW
      }

    ]
  },

  // ======================================================
  // MANAGEMENT
  // ======================================================

  {
    section:
      "sidebar.management",

    items: [

      {
        label:
          "sidebar.pricing",

        path:
          "/pricing",

        icon:
          DollarSign,

        permission:
          PERMISSIONS.PRICING_VIEW
      },

      {
        label:
          "sidebar.reports",

        path:
          "/reports",

        icon:
          BarChart3,

        permission:
          PERMISSIONS.REPORTS_VIEW
      },

      {
        label:
          "sidebar.customers",

        path:
          "/customers",

        icon:
          Users2,

        ownerOnly: true
      },

      {
        label:
          "sidebar.branches",

        path:
          "/branches",

        icon:
          Building2,

        permission:
          PERMISSIONS.SETTINGS_VIEW
      },

      {
        label:
          "sidebar.users",

        path:
          "/users",

        icon:
          Users,

        permission:
          PERMISSIONS.USERS_VIEW
      },

      {
        label:
          "sidebar.logs",

        path:
          "/logs",

        icon:
          FileText,

        permission:
          PERMISSIONS.LOGS_VIEW
      }

    ]
  }

];