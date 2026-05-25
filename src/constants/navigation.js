import {
  Home,
  ShoppingCart,
  Boxes,
  BarChart3,
  Users,
  Settings,
  Receipt,
  RefreshCw,
  DollarSign,
  Building2,
  FileText,
  Repeat,
  PackagePlus,
  Trash2,
  Users2
} from "lucide-react";

import {
  PERMISSIONS
} from "../constants/permissions";

export const NAVIGATION_ITEMS = [

  {
    section: "Main",

    items: [

      {
        label: "Dashboard",

        path: "/dashboard",

        icon: Home
      },

      {
        label: "Sales",

        path: "/sales",

        icon: ShoppingCart,

        permission:
          PERMISSIONS.SALES_CREATE
      }
    ]
  },



  {
    section: "Operations",

    items: [

      {
        label: "Expenses",

        path: "/expenses",

        icon: Receipt,

        permission:
          PERMISSIONS.EXPENSES_VIEW
      },

      {
        label: "Returns",

        path: "/returns",

        icon: RefreshCw,

        permission:
          PERMISSIONS.RETURNS_VIEW
      },

      {
        label: "Inventory",

        path: "/inventory",

        icon: Boxes,

        permission:
          PERMISSIONS.INVENTORY_VIEW
      },

      {
        label: "Purchases",

        path: "/purchases",

        icon: PackagePlus,

        permission:
          PERMISSIONS.INVENTORY_VIEW
      },

      {
        label: "Operations",

        path: "/operations",

        icon: Repeat,

        permission:
        PERMISSIONS.OPERATIONS_VIEW
      },

      {
        label: "Waste",

        path: "/waste",

        icon: Trash2,

        permission:
          PERMISSIONS.INVENTORY_ADJUST
      }
    ]
  },



  {
    section: "Management",

    items: [

      {
        label: "Pricing",

        path: "/pricing",

        icon: DollarSign,

        permission:
          PERMISSIONS.PRICING_VIEW
      },

      {
        label: "Reports",

        path: "/reports",

        icon: BarChart3,

        permission:
          PERMISSIONS.REPORTS_VIEW
      },

      {
        label: "Customers",

        path: "/customers",

        icon: Users2,

        ownerOnly: true
      },

      {
        label: "Branches",

        path: "/branches",

        icon: Building2,

        permission:
          PERMISSIONS.SETTINGS_VIEW
      },

      {
        label: "Users",

        path: "/users",

        icon: Users,

        permission:
          PERMISSIONS.USERS_VIEW
      },

      {
        label: "Logs",

        path: "/logs",

        icon: FileText,

        permission:
          PERMISSIONS.LOGS_VIEW
      },
    ]
  }
];