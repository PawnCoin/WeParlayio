import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  User, 
  CreditCard,
  Eye,
  Lock,
  Camera,
  Shield,
  Clock
} from 'lucide-react';

export default function KYCVerification() {
  const [verificationStep, setVerificationStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    identity: null,
    address: null,
    selfie: null
  });
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const fileInputRef = useRef(null);

  // This would come from your KYC service
  const kycData = {
    currentUser: {
      id: 'user123',
      email: 'user@example.com',
      verificationStatus: 'pending_documents',
      tier: 'Bronze',
      documentsSubmitted: 2,
      documentsRequired: 3,
      verificationLevel: 'Level 1'
    },
    requirements: {
      level1: {
        documents: ['government_id', 'proof_of_address'],
        limits: { deposit: 1000, withdrawal: 500 },
        description: 'Basic verification for limited betting'
      },
      level2: {
        documents: ['government_id', 'proof_of_address', 'selfie_verification'],
        limits: { deposit: 10000, withdrawal: 5000 },
        description: 'Enhanced verification for higher limits'
      },
      level3: {
        documents: ['government_id', 'proof_of_address', 'selfie_verification', 'source_of_funds'],
        limits: { deposit: 50000, withdrawal: 25000 },
        description: 'Premium verification for VIP betting'
      }
    },
    supportedDocuments: {
      identity: ['passport', 'drivers_license', 'national_id'],
      address: ['utility_bill', 'bank_statement', 'rental_agreement'],
      selfie: ['selfie_with_id']
    }
  };

  const handleDocumentUpload = (documentType: string, file: File) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const getVerificationProgress = () => {
    const totalSteps = 4;
    return Math.min((verificationStep / totalSteps) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'under_review': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const DocumentUploadCard = ({ documentType, title, description, acceptedFormats }: {
    documentType: string;
    title: string;
    description: string;
    acceptedFormats: string[];
  }) => (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
      <CardContent className="p-6 text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleDocumentUpload(documentType, file);
            }
          }}
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          {uploadedDocuments[documentType] ? 'Replace Document' : 'Upload Document'}
        </Button>
        {uploadedDocuments[documentType] && (
          <div className="mt-2 flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Document uploaded</span>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Accepted: {acceptedFormats.join(', ')}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
        <p className="text-gray-600">Secure verification to unlock full betting features</p>
      </div>

      {/* Verification Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Progress</span>
            <Badge variant={verificationStatus === 'verified' ? 'default' : 'secondary'}>
              {verificationStatus.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getVerificationProgress()} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {verificationStep} of 4</span>
              <span>{Math.round(getVerificationProgress())}% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verification">Document Upload</TabsTrigger>
          <TabsTrigger value="levels">Verification Levels</TabsTrigger>
          <TabsTrigger value="status">Status & History</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          {verificationStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => setVerificationStep(2)} className="w-full">
                  Continue to Document Upload
                </Button>
              </CardContent>
            </Card>
          )}

          {verificationStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Identity Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUploadCard
                    documentType="identity"
                    title="Government-Issued ID"
                    description="Upload a clear photo of your passport, driver's license, or national ID"
                    acceptedFormats={['jpg', 'png', 'pdf']}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationStep(1)}>
                  Previous
                </Button>
                <Button 
                  onClick={() => setVerificationStep(3)}
                  disabled={!uploadedDocuments.identity}
                >
                  Continue to Address Verification
                </Button>
              </div>
            </div>
          )}

          {verificationStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Proof of Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUploadCard
                    documentType="address"
                    title="Address Verification"
                    description="Upload a recent utility bill, bank statement, or official document showing your address"
                    acceptedFormats={['jpg', 'png', 'pdf']}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationStep(2)}>
                  Previous
                </Button>
                <Button 
                  onClick={() => setVerificationStep(4)}
                  disabled={!uploadedDocuments.address}
                >
                  Continue to Selfie Verification
                </Button>
              </div>
            </div>
          )}

          {verificationStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Selfie Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUploadCard
                    documentType="selfie"
                    title="Selfie with ID"
                    description="Take a clear selfie holding your ID document next to your face"
                    acceptedFormats={['jpg', 'png']}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationStep(3)}>
                  Previous
                </Button>
                <Button 
                  disabled={!uploadedDocuments.selfie}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit for Verification
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(kycData.requirements).map(([level, requirements]) => (
              <Card key={level} className="relative">
                <CardHeader>
                  <CardTitle className="capitalize">{level.replace('level', 'Level ')}</CardTitle>
                  <p className="text-sm text-gray-600">{requirements.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Required Documents</h4>
                      <div className="space-y-1">
                        {requirements.documents.map(doc => (
                          <div key={doc} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm capitalize">{doc.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Betting Limits</h4>
                      <div className="space-y-1 text-sm">
                        <div>Deposit: ${requirements.limits.deposit.toLocaleString()}</div>
                        <div>Withdrawal: ${requirements.limits.withdrawal.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Level</span>
                  <Badge>{kycData.currentUser.verificationLevel}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Documents Submitted</span>
                  <span>{kycData.currentUser.documentsSubmitted}/{kycData.currentUser.documentsRequired}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Document Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Government ID</span>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Proof of Address</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Selfie Verification</span>
                      <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-gray-600">December 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Government ID Submitted</p>
                    <p className="text-sm text-gray-600">December 2, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Address Verification Pending</p>
                    <p className="text-sm text-gray-600">December 3, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Important Notices */}
      <div className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All documents are encrypted and stored securely. We comply with international data protection standards.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Verification typically takes 24-48 hours. You'll receive email updates on your verification status.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}