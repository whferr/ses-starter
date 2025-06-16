import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  User, 
  Mail,
  Clock,
  MapPin,
  Phone,
  Globe,
  Heart,
  Zap,
  ChevronRight,
  MessageSquare,
  Share,
  Bookmark
} from 'lucide-react';

export const UIKit: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">UI Component Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern collection of reusable components built with shadcn/ui and Tailwind CSS
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Various button styles and configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Button Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>Flexible card layouts for content organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>Basic card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a simple card component that displays content in a clean, organized way.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>Card with action buttons</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enhanced card with interactive elements and status indicators.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Data visualization card</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">$12,345</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input type="password" placeholder="Enter your password" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company</label>
                  <Input placeholder="Acme Inc." />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">Badge Variants</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Status Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">With Icons</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <User className="w-3 h-3" />
                  Team Member
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Mail className="w-3 h-3" />
                  Email Verified
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Zap className="w-3 h-3" />
                  Premium
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alert Components</CardTitle>
            <CardDescription>Important messages and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational alert to provide context or additional information.
              </AlertDescription>
            </Alert>

            <Alert className="border-green-200 bg-green-50 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your changes have been saved successfully. All data is up to date.
              </AlertDescription>
            </Alert>

            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please review your settings before proceeding. Some changes may affect other users.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Clickable cards and interactive elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-2">Comments</h4>
                  <p className="text-sm text-muted-foreground">Manage and review all comments</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Share className="w-8 h-8 text-primary" />
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-2">Share Content</h4>
                  <p className="text-sm text-muted-foreground">Share with your team members</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Bookmark className="w-8 h-8 text-primary" />
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-2">Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">Saved items and favorites</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Layout Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dashboard Layout Examples</CardTitle>
            <CardDescription>Stats cards and data visualization patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Statistics Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">2,345</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-green-600 font-medium">+12%</span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">$12,345</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-green-600 font-medium">+8%</span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">856</p>
                        <p className="text-xs text-muted-foreground">Active Sessions</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-red-600 font-medium">-3%</span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">98.5%</p>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-green-600 font-medium">+0.5%</span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* User Profile Cards */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Profile Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Alex Johnson</h4>
                        <p className="text-muted-foreground mb-3">Senior Frontend Developer</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            alex.johnson@company.com
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            San Francisco, CA
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">Message</Button>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Sarah Chen</h4>
                        <p className="text-muted-foreground mb-3">Product Designer</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            sarahchen.design
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            +1 (555) 123-4567
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">Message</Button>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Built with shadcn/ui and Tailwind CSS • Ready to use components
          </p>
        </div>
      </div>
    </div>
  );
}; 