import { Button } from "./ui/button"
import { Link } from "react-router-dom";

import { Input } from "./ui/input"
import { ArrowRight, BarChart2, Camera, Utensils, Users, ShoppingBag } from "lucide-react"
// import Image from "next/image"
// import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Utensils className="h-6 w-6 text-green-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">HealthyU</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#community">
            Community
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#recipes">
            Recipes
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Personal Health & Wellness Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Manage your nutrition, connect with a community, and make informed decisions about your health with
                  our all-in-one platform.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BarChart2 className="h-10 w-10 text-green-600" />}
                title="Health Metrics & Caloric Needs"
                description="Calculate your BMI and get personalized caloric recommendations based on your goals."
              />
              <FeatureCard
                icon={<Camera className="h-10 w-10 text-green-600" />}
                title="Food Logging & Tracking"
                description="Log your meals manually or by image, and track your nutritional progress effortlessly."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-green-600" />}
                title="Community Forum"
                description="Connect with like-minded individuals, share experiences, and get support on your wellness journey."
              />
              <FeatureCard
                icon={<Utensils className="h-10 w-10 text-green-600" />}
                title="Recipe Repository"
                description="Discover, contribute, and rate recipes tailored to various health goals."
              />
              <FeatureCard
                icon={<ShoppingBag className="h-10 w-10 text-green-600" />}
                title="Packaged Food Analysis"
                description="Upload food labels for instant analysis and personalized dietary recommendations."
              />
              <FeatureCard
                icon={<ArrowRight className="h-10 w-10 text-green-600" />}
                title="Personalized Insights"
                description="Receive tailored advice and insights based on your unique health profile and goals."
              />
            </div>
          </div>
        </section>
        <section id="community" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <Image
                alt="Community forum screenshot"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                height="310"
                src="/placeholder.svg"
                width="550"
              />
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Community</h2>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Connect with others, share your journey, and get inspired. Our vibrant community is here to support
                  you every step of the way.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 w-fit">Join Now</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="recipes" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Discover Healthy Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RecipeCard
                title="Green Smoothie Bowl"
                description="Start your day with this nutrient-packed smoothie bowl."
                category="Weight Loss"
              />
              <RecipeCard
                title="High-Protein Chicken Stir-Fry"
                description="A delicious and protein-rich meal for muscle building."
                category="Muscle Gain"
              />
              <RecipeCard
                title="Mediterranean Quinoa Salad"
                description="A balanced and flavorful salad for overall wellness."
                category="Balanced Diet"
              />
            </div>
            <div className="text-center mt-12">
              <Button variant="outline">View All Recipes</Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Your Wellness Journey Today
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl">
                Join thousands of users who have transformed their lives with HealthyU. Sign up now and take the first
                step towards a healthier you.
              </p>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="flex-1" placeholder="Enter your email" type="email" />
                  <Button className="bg-green-600 hover:bg-green-700" type="submit">
                    Sign Up
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2023 HealthyU. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-4 border rounded-lg shadow-sm">
      {icon}
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}

function RecipeCard({ title, description, category }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Image
        alt={title}
        className="object-cover w-full h-48"
        height="200"
        src="/placeholder.svg"
        width="300"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="mt-4 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
          {category}
        </div>
      </div>
    </div>
  )
}