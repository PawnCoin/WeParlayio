
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shield, 
  Globe, 
  Rocket,
  Star,
  Target,
  BarChart3,
  Handshake,
  Mail,
  Phone,
  Building2,
  Crown,
  Zap,
  Award
} from 'lucide-react';

interface BusinessProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessProposalModal: React.FC<BusinessProposalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const revenueProjections = [
    { year: 'Year 1', users: '50K', volume: '$50M', revenue: '$5M', partnerPayouts: '$1.5M' },
    { year: 'Year 2', users: '200K', volume: '$200M', revenue: '$20M', partnerPayouts: '$6M' },
    { year: 'Year 3', users: '500K', volume: '$500M', revenue: '$50M', partnerPayouts: '$15M' }
  ];

  const partnershipTiers = [
    {
      name: 'Bronze Partner',
      price: 'Free',
      features: ['Basic API integration', 'Standard revenue sharing', 'Marketing co-op eligibility', 'Technical support'],
      color: 'bg-amber-100 text-amber-800'
    },
    {
      name: 'Silver Partner',
      price: '$50K',
      features: ['Premium integration showcase', 'Enhanced revenue sharing (+5%)', 'Priority support', 'Joint marketing campaigns'],
      color: 'bg-gray-100 text-gray-800'
    },
    {
      name: 'Gold Partner',
      price: '$250K',
      features: ['Exclusive category partnership', 'Maximum revenue sharing (+10%)', 'Custom integration features', 'Executive relationship management'],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      name: 'Platinum Partner',
      price: '$500K+',
      features: ['Strategic partnership status', 'Equity consideration', 'Board advisory position', 'Co-development opportunities'],
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-green-600">
            <Rocket className="mr-2 h-6 w-6" />
            WeParlay.io - Strategic Partnership & Business Proposal
          </DialogTitle>
          <p className="text-gray-600">Where Sports Betting Meets Innovation - Join the Revolution!</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  WeParlay.io is a next-generation sports betting platform revolutionizing the industry with <Badge className="bg-green-100 text-green-800">100% completion</Badge> and ready for explosive growth.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">$231B</div>
                    <div className="text-sm text-gray-600">Global Market Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12.9%</div>
                    <div className="text-sm text-gray-600">CAGR Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2-5%</div>
                    <div className="text-sm text-gray-600">Target Market Share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">$250M</div>
                    <div className="text-sm text-gray-600">Annual Revenue Goal</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-yellow-600" />
                  Platform Advantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <div className="font-semibold">7 Premium APIs</div>
                      <div className="text-sm text-gray-600">NBA Official, MLB Stats, ESPN NFL, F1 Official, Grid.gg Esports</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Globe className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-semibold">74,000+ Esports Series</div>
                      <div className="text-sm text-gray-600">Unmatched tournament coverage</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <div className="font-semibold">100% Authentic Data</div>
                      <div className="text-sm text-gray-600">Zero fake information, all official sources</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <div className="font-semibold">Production Ready</div>
                      <div className="text-sm text-gray-600">No beta testing, enterprise-grade platform</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Building2 className="mr-2 h-5 w-5" />
                    API & Data Providers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What We Offer:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• $100K minimum annual commitment</li>
                      <li>• Featured integration showcase</li>
                      <li>• 50,000+ projected users exposure</li>
                      <li>• Premium technical implementation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Revenue Models:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Fixed Annual: $100K - $2M</li>
                      <li>• Usage-Based: $0.10 - $1.00 per call</li>
                      <li>• Revenue Share: 5-15% of betting volume</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Users className="mr-2 h-5 w-5" />
                    Affiliate Partners
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Commission Structure:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Tier 1: 25% lifetime (0-100 referrals)</li>
                      <li>• Tier 2: 35% lifetime (101-500 referrals)</li>
                      <li>• Tier 3: 45% lifetime (500+ referrals)</li>
                      <li>• Bonus: $500 per VIP upgrade</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Projected Earnings:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 100 Users: $2,500-4,500/month</li>
                      <li>• 500 Users: $15,000-25,000/month</li>
                      <li>• 1,000+ Users: $35,000-60,000/month</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Handshake className="mr-2 h-5 w-5" />
                  Strategic Business Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Enterprise Opportunities:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• White Label Licensing</li>
                      <li>• Revenue Sharing Partnerships</li>
                      <li>• Integration Partnerships</li>
                      <li>• Marketing Alliances</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Equity stakes available</li>
                      <li>• Seamless platform connections</li>
                      <li>• Cross-promotional opportunities</li>
                      <li>• Custom development options</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                  3-Year Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Year</th>
                        <th className="border border-gray-300 p-3 text-left">Users</th>
                        <th className="border border-gray-300 p-3 text-left">Volume</th>
                        <th className="border border-gray-300 p-3 text-left">Revenue</th>
                        <th className="border border-gray-300 p-3 text-left">Partner Payouts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueProjections.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-semibold">{row.year}</td>
                          <td className="border border-gray-300 p-3">{row.users}</td>
                          <td className="border border-gray-300 p-3">{row.volume}</td>
                          <td className="border border-gray-300 p-3 text-green-600 font-semibold">{row.revenue}</td>
                          <td className="border border-gray-300 p-3 text-blue-600 font-semibold">{row.partnerPayouts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Status (Pre-Launch)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Platform Completion:</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Integrations:</span>
                    <Badge className="bg-blue-100 text-blue-800">7 Premium</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Rating:</span>
                    <Badge className="bg-purple-100 text-purple-800">Military-Grade</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile Optimization:</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Advantages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="font-semibold">Official Data Sources</div>
                    <div className="text-gray-600">No fake/mock data anywhere</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Massive Esports Coverage</div>
                    <div className="text-gray-600">74,000+ series unique to market</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Premium Technology</div>
                    <div className="text-gray-600">Modern stack vs legacy competitors</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">User Experience</div>
                    <div className="text-gray-600">Premium design vs standard interfaces</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnershipTiers.map((tier, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{tier.name}</span>
                      <Badge className={tier.color}>{tier.price}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Crown className="mr-2 h-5 w-5" />
                  Early Partner Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50%</div>
                    <div className="text-sm text-gray-600">Bonus Revenue Share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Limited</div>
                    <div className="text-sm text-gray-600">Partnership Slots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Exclusive</div>
                    <div className="text-sm text-gray-600">Territory Rights</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-blue-600" />
                    Partnership Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">partnerships@weparlay.io</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">+1 (555) WEPARLAY</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">WeParlay HQ, Innovation District</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-green-600" />
                    Key Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">CEO:</span> founder@weparlay.io
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">CTO:</span> technology@weparlay.io
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Business Development:</span> bd@weparlay.io
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Marketing:</span> marketing@weparlay.io
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <Rocket className="mr-2 h-5 w-5" />
                  Ready to Join the Revolution?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">Don't miss this opportunity to be part of the next big thing in sports betting!</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Reply to this proposal with your interest level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Schedule a demo to see the platform in action</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Receive custom proposal within 48 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Start earning within 2 weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Last Updated: January 2025 | Status: Ready for Partnership
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProposalModal;
