import { Link, NavLink, Outlet } from "react-router-dom"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useContext, useState } from "react"


export function Dashboard() {
  
  const [isLoading , setIsLoading] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] pb-16 pt-1">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Welcome, Om</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary " +
                  (isActive ? "bg-muted" : "text-muted-foreground")
                }
                end
              >
                <Home className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink
                to='/dashboard/incident-reports'
                className={({ isActive }) => "flex items-center gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary " + (isActive ? " bg-muted" : " text-muted-foreground")}
              >
                <ShoppingCart className="h-4 w-4" />
                Incident-Reports
              </NavLink>
              <NavLink
                to='/dashboard/table2'
                className={({ isActive }) => "flex items-center gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary " + (isActive ? " bg-muted" : " text-muted-foreground")}
              >
                <Package className="h-4 w-4" />
                Tables
              </NavLink>
            </nav>
          </div>
         
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">AapkaRakshak</span>
                </Link>
                <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary " +
                  (isActive ? "bg-muted" : "text-muted-foreground")
                }
                end
              >
                <Home className="h-4 w-4" />
                Dashboard
              </NavLink>
                <NavLink
                to='/dashboard/incident-reports'
                className={({ isActive }) => "flex items-center gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary " + (isActive ? " bg-muted" : " text-muted-foreground")}
              >
                <ShoppingCart className="h-4 w-4" />
                Incident Reports
              </NavLink>
                <NavLink
                to='/dashboard/table2'
                className={({ isActive }) => "flex items-center gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary " + (isActive ? " bg-muted" : " text-muted-foreground")}
              >
                <Package className="h-4 w-4" />
                Tables
              </NavLink>
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
               
              </div>
            </form>
          </div>
          
        </header>

        {<Outlet context={{ isLoading, setIsLoading }} />}
      </div>
    </div>
  )
}