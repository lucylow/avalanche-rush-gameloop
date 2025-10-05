// Career Path System and Certification Framework
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  BookOpen, 
  Code, 
  TrendingUp,
  Shield,
  Award,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// Career Path Component
export const CareerPathSystem: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('developer');
  const [userProgress, setUserProgress] = useState<any>({});
  const [certifications, setCertifications] = useState<any[]>([]);

  useEffect(() => {
    // Load user progress from localStorage or API
    const savedProgress = localStorage.getItem('careerProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  const careerPaths = {
    developer: {
      title: "Blockchain Developer",
      description: "Build the future of decentralized applications",
      icon: <Code className="h-8 w-8" />,
      color: "bg-blue-500",
      skills: ["Solidity", "Smart Contracts", "DeFi Protocols", "Subnet Development"],
      modules: [
        { id: "solidity-basics", name: "Solidity Fundamentals", completed: false, progress: 0 },
        { id: "contract-deployment", name: "Contract Deployment", completed: false, progress: 0 },
        { id: "advanced-patterns", name: "Advanced Patterns", completed: false, progress: 0 },
        { id: "subnet-creation", name: "Subnet Creation", completed: false, progress: 0 }
      ],
      certifications: [
        { id: "avalanche-dev", name: "Avalanche Developer Certification", earned: false },
        { id: "solidity-expert", name: "Solidity Expert Badge", earned: false }
      ],
      jobOpportunities: [
        "Smart Contract Developer",
        "DeFi Protocol Engineer", 
        "Subnet Developer",
        "Blockchain Architect"
      ]
    },
    trader: {
      title: "DeFi Trader",
      description: "Master decentralized finance trading strategies",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "bg-green-500",
      skills: ["Market Analysis", "Risk Management", "Portfolio Optimization", "Arbitrage"],
      modules: [
        { id: "liquidity-pools", name: "Liquidity Pools", completed: false, progress: 0 },
        { id: "yield-farming", name: "Yield Farming", completed: false, progress: 0 },
        { id: "impermanent-loss", name: "Impermanent Loss", completed: false, progress: 0 },
        { id: "flash-loans", name: "Flash Loans", completed: false, progress: 0 }
      ],
      certifications: [
        { id: "defi-specialist", name: "DeFi Specialist Badge", earned: false },
        { id: "risk-manager", name: "Risk Manager Certification", earned: false }
      ],
      jobOpportunities: [
        "DeFi Trader",
        "Portfolio Manager",
        "Risk Analyst", 
        "Arbitrage Specialist"
      ]
    },
    entrepreneur: {
      title: "Web3 Entrepreneur",
      description: "Launch and scale Web3 businesses",
      icon: <Users className="h-8 w-8" />,
      color: "bg-purple-500",
      skills: ["Tokenomics", "Community Building", "Product Development", "DAO Management"],
      modules: [
        { id: "voting-mechanics", name: "Voting Mechanics", completed: false, progress: 0 },
        { id: "treasury-management", name: "Treasury Management", completed: false, progress: 0 },
        { id: "dao-creation", name: "DAO Creation", completed: false, progress: 0 },
        { id: "tokenomics", name: "Tokenomics Design", completed: false, progress: 0 }
      ],
      certifications: [
        { id: "web3-entrepreneur", name: "Web3 Entrepreneur Certification", earned: false },
        { id: "dao-founder", name: "DAO Founder Badge", earned: false }
      ],
      jobOpportunities: [
        "Web3 Startup Founder",
        "DAO Manager",
        "Community Manager",
        "Product Manager"
      ]
    },
    validator: {
      title: "Avalanche Validator",
      description: "Secure the Avalanche network",
      icon: <Shield className="h-8 w-8" />,
      color: "bg-orange-500",
      skills: ["Network Security", "Staking", "Validation", "Infrastructure"],
      modules: [
        { id: "subnet-security", name: "Subnet Security", completed: false, progress: 0 },
        { id: "treasury-management", name: "Treasury Management", completed: false, progress: 0 },
        { id: "governance", name: "Governance", completed: false, progress: 0 },
        { id: "infrastructure", name: "Infrastructure Setup", completed: false, progress: 0 }
      ],
      certifications: [
        { id: "avalanche-validator", name: "Avalanche Validator Certification", earned: false },
        { id: "security-expert", name: "Security Expert Badge", earned: false }
      ],
      jobOpportunities: [
        "Network Validator",
        "Infrastructure Engineer",
        "Security Specialist",
        "Network Operations"
      ]
    }
  };

  const calculatePathProgress = (path: any) => {
    const completedModules = path.modules.filter((m: any) => m.completed).length;
    const totalModules = path.modules.length;
    return (completedModules / totalModules) * 100;
  };

  const getCertificationLevel = (path: any) => {
    const earnedCerts = path.certifications.filter((c: any) => c.earned).length;
    const totalCerts = path.certifications.length;
    
    if (earnedCerts === totalCerts) return 'platinum';
    if (earnedCerts >= totalCerts * 0.75) return 'gold';
    if (earnedCerts >= totalCerts * 0.5) return 'silver';
    return 'bronze';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <GraduationCap className="inline-block mr-3 h-10 w-10" />
            Career Path System
          </h1>
          <p className="text-xl text-gray-300">
            Choose your path to Web3 mastery and unlock real-world opportunities
          </p>
        </div>

        <Tabs value={selectedPath} onValueChange={setSelectedPath} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {Object.entries(careerPaths).map(([key, path]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                {path.icon}
                <span className="hidden sm:inline">{path.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(careerPaths).map(([key, path]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              {/* Career Path Header */}
              <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${path.color}`}>
                        {path.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">{path.title}</CardTitle>
                        <p className="text-gray-300">{path.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {Math.round(calculatePathProgress(path))}% Complete
                    </Badge>
                  </div>
                  <Progress 
                    value={calculatePathProgress(path)} 
                    className="mt-4 h-3"
                  />
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Modules */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="h-5 w-5" />
                      Learning Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {path.modules.map((module: any, index: number) => (
                      <div key={module.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            module.completed ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {module.completed ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <span className="text-white font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{module.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>15-30 min</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={module.completed ? "outline" : "default"}
                          disabled={module.completed}
                        >
                          {module.completed ? 'Completed' : 'Start'}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {path.certifications.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            cert.earned ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {cert.earned ? (
                              <Trophy className="h-5 w-5 text-white" />
                            ) : (
                              <Star className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-400">
                              {cert.earned ? 'Earned' : 'In Progress'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={cert.earned ? "default" : "outline"}>
                          {cert.earned ? 'Earned' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Skills & Job Opportunities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="h-5 w-5" />
                      Skills You'll Master
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="h-5 w-5" />
                      Career Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {path.jobOpportunities.map((job: string) => (
                        <div key={job} className="flex items-center gap-2 text-gray-300">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>{job}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Certification Level */}
              <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500">
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    Current Certification Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">
                    {getCertificationLevel(path).toUpperCase()}
                  </div>
                  <p className="text-yellow-100">
                    {path.certifications.filter((c: any) => c.earned).length} of {path.certifications.length} certifications earned
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

// Certification Badge Component
export const CertificationBadge: React.FC<{
  certification: any;
  size?: 'sm' | 'md' | 'lg';
}> = ({ certification, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg`}>
      <Trophy className={`${size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'} text-white`} />
    </div>
  );
};

// Progress Tracking Component
export const ProgressTracker: React.FC<{
  careerPath: string;
  modules: any[];
  certifications: any[];
}> = ({ careerPath, modules, certifications }) => {
  const completedModules = modules.filter(m => m.completed).length;
  const earnedCerts = certifications.filter(c => c.earned).length;
  const totalProgress = ((completedModules + earnedCerts) / (modules.length + certifications.length)) * 100;

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{completedModules}</div>
            <div className="text-sm text-gray-400">Modules Completed</div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{earnedCerts}</div>
            <div className="text-sm text-gray-400">Certifications Earned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerPathSystem;
