"use client";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Button from '@/components/Button';
import Input from '@/components/Input';
import React, { useEffect, useMemo, useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassmorphicCard from '@/components/auth/GlassmorphicCard';
import { useAuthTheme } from '../layout';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth';

export default function RegisterPage() {
    const { theme } = useAuthTheme();
    const { setUser, setIsAuthenticated } = useAuth();
    const router = useRouter();

    // Multi-step form: 1 = role, 2 = form, 3 = company (recruiter only)
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<'developer' | 'recruiter' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        role: 'developer' as 'developer' | 'recruiter',
        companyId: '' as string | number | '',
    });
    const [formError, setFormError] = useState<string | null>(null);

    // Companies for recruiter
    const [companies, setCompanies] = useState<Array<{ id: string | number; name: string }>>([]);
    const [companySearch, setCompanySearch] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        logoUrl: '',
        description: '',
    });

    const filteredCompanies = useMemo(
        () => companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase())),
        [companies, companySearch]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setFormError(null);
    };

    const handleGoogleLogin = () => {
        try {
          authService.initiateGoogleLogin();
        } catch (err) {
          setFormError('Failed to initiate Google login');
        }
      };
      const handleGithubLogin = () => {
        try {
          authService.initiateGithubLogin();
        } catch (err) {
          setFormError('Failed to initiate Github login');
        }
      };
    // Fetch companies when recruiter selected
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await apiClient.get<Array<{ id: string | number; name: string }>>('/auth-service/api/company');
                if (Array.isArray(res)) setCompanies(res);
            } catch {
                // Fallback sample list
                setCompanies([
                    { id: '1', name: 'TechCorp Inc.' },
                    { id: '2', name: 'StartupXYZ' },
                    { id: '3', name: 'PixelForge Studios' },
                ]);
            }
        };
        if (selectedRole === 'recruiter' && companies.length === 0) fetchCompanies();
    }, [selectedRole, companies.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Step 1: Role selection - move to step 2
        if (currentStep === 1) {
            if (!selectedRole) {
                setFormError('Please select a role');
                return;
            }
            setCurrentStep(2);
            return;
        }

        // Step 2: Form validation
        if (currentStep === 2) {
            // Validate username
            if (!formData.username || formData.username.length < 3 || formData.username.length > 30) {
                setFormError('Username must be between 3 and 30 characters');
                return;
            }

            // Validate all fields
            if (!formData.name || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.password || !formData.confirmPassword) {
                setFormError('Please fill in all fields');
                return;
            }

            if (!formData.email.includes('@')) {
                setFormError('Please enter a valid email');
                return;
            }

            if (formData.phone.length < 10 || formData.phone.length > 15) {
                setFormError('Phone number must be between 10 and 15 characters');
                return;
            }

            if (formData.password.length < 3) {
                setFormError('Password must be at least 3 characters');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setFormError('Passwords do not match');
                return;
            }

            // If developer, submit directly
            if (selectedRole === 'developer') {
                await submitRegistration('developer');
            } else {
                // If recruiter, move to company selection
                setCurrentStep(3);
            }
            return;
        }

        // Step 3: Company selection (recruiter only)
        if (currentStep === 3) {
            if (!formData.companyId) {
                setFormError('Please select a company');
                return;
            }
            await submitRegistration('recruiter');
        }
    };

    const submitRegistration = async (role: 'developer' | 'recruiter') => {
        try {
            setIsLoading(true);
            const response = await authService.register({
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                password: formData.password,
                role,
                companyId: role === 'recruiter' ? String(formData.companyId) : undefined,
            });
            // Optionally set user if registration returns user data
            // setUser(response.user);
            // setIsAuthenticated(true);
            router.push('/auth/otp-verification');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AuthHeader
                title="CREATE ACCOUNT"
                subtitle='JOIN TALENTHIUM ECOSYSTEM'
                theme={theme}
            />
            <GlassmorphicCard theme={theme} handleGoogleLogin={handleGoogleLogin} handleGithubLogin={handleGithubLogin}>
                {/* Step Indicator with Labels */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {[1, 2, 3].map((step) => {
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;
                            const isRelevant = !(step === 3 && selectedRole === 'developer');
                            
                            if (!isRelevant) return null;

                            const labels = ['Role', 'Details', 'Company'];

                            return (
                                <div key={step} className="flex flex-col items-center flex-1">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors mb-2 ${
                                        isActive || isCompleted 
                                            ? 'bg-teal-500 text-white' 
                                            : theme === 'dark' 
                                                ? 'bg-white/10 text-gray-400 border border-white/20' 
                                                : 'bg-white/20 text-teal-100 border border-white/30'
                                    }`}>
                                        {isCompleted ? '✓' : step}
                                    </div>
                                    <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-teal-300' : theme === 'dark' ? 'text-gray-500' : 'text-teal-200/60'}`}>
                                        {labels[step - 1]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="flex items-center justify-between">
                        {[1, 2].map((step) => {
                            const isRelevant = !(step === 2 && selectedRole === 'developer');
                            if (!isRelevant) return null;
                            
                            return (
                                <div
                                    key={step}
                                    className={`flex-1 h-1 mx-1 rounded transition-colors ${
                                        step < currentStep
                                            ? 'bg-teal-500'
                                            : theme === 'dark'
                                                ? 'bg-white/10'
                                                : 'bg-white/20'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* STEP 1: Role Selection */}
                {currentStep === 1 && (
                    <div className="mb-6">
                        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-teal-50'}`}>
                            What would you like to register as?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => { 
                                    if (selectedRole === 'developer') {
                                        setSelectedRole(null);
                                    } else {
                                        setSelectedRole('developer');
                                        setFormData(prev => ({ ...prev, role: 'developer' }));
                                    }
                                }}
                                className={`relative group overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 ${
                                    selectedRole === 'developer'
                                        ? theme === 'dark'
                                            ? 'border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                                            : 'border-teal-300 bg-teal-400/15 shadow-lg shadow-teal-400/25'
                                        : theme === 'dark'
                                            ? 'border-white/10 bg-white/5 hover:border-teal-300/50 hover:bg-white/8'
                                            : 'border-white/20 bg-white/10 hover:border-teal-300/40 hover:bg-white/15'
                                }`}
                            >
                                {/* Background gradient effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${
                                    selectedRole === 'developer'
                                        ? 'from-teal-500/20 to-transparent'
                                        : 'from-teal-500/0 to-transparent'
                                } opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                                
                                {/* Selection checkmark */}
                                {selectedRole === 'developer' && (
                                    <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-teal-400 text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl transition-colors ${
                                        selectedRole === 'developer'
                                            ? 'bg-teal-500/30 text-teal-200'
                                            : theme === 'dark'
                                                ? 'bg-white/10 text-teal-300'
                                                : 'bg-white/20 text-teal-200'
                                    }`}>
                                        <FaUser className="text-2xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold text-base mb-1 ${selectedRole === 'developer' ? 'text-teal-200' : theme === 'dark' ? 'text-white' : 'text-teal-50'}`}>Developer</p>
                                        <p className={`text-xs leading-relaxed ${selectedRole === 'developer' ? 'text-teal-300/80' : theme === 'dark' ? 'text-gray-400' : 'text-teal-100'}`}>Build portfolio, apply<br/>for opportunities</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => { 
                                    if (selectedRole === 'recruiter') {
                                        setSelectedRole(null);
                                    } else {
                                        setSelectedRole('recruiter');
                                        setFormData(prev => ({ ...prev, role: 'recruiter' }));
                                    }
                                }}
                                className={`relative group overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 ${
                                    selectedRole === 'recruiter'
                                        ? theme === 'dark'
                                            ? 'border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                                            : 'border-teal-300 bg-teal-400/15 shadow-lg shadow-teal-400/25'
                                        : theme === 'dark'
                                            ? 'border-white/10 bg-white/5 hover:border-teal-300/50 hover:bg-white/8'
                                            : 'border-white/20 bg-white/10 hover:border-teal-300/40 hover:bg-white/15'
                                }`}
                            >
                                {/* Background gradient effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${
                                    selectedRole === 'recruiter'
                                        ? 'from-teal-500/20 to-transparent'
                                        : 'from-teal-500/0 to-transparent'
                                } opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                                
                                {/* Selection checkmark */}
                                {selectedRole === 'recruiter' && (
                                    <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-teal-400 text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl transition-colors ${
                                        selectedRole === 'recruiter'
                                            ? 'bg-teal-500/30 text-teal-200'
                                            : theme === 'dark'
                                                ? 'bg-white/10 text-teal-300'
                                                : 'bg-white/20 text-teal-200'
                                    }`}>
                                        <FaBuilding className="text-2xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold text-base mb-1 ${selectedRole === 'recruiter' ? 'text-teal-200' : theme === 'dark' ? 'text-white' : 'text-teal-50'}`}>Recruiter</p>
                                        <p className={`text-xs leading-relaxed ${selectedRole === 'recruiter' ? 'text-teal-300/80' : theme === 'dark' ? 'text-gray-400' : 'text-teal-100'}`}>Post jobs, hire<br/>talented developers</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selectedRole || isLoading}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform ${
                                !selectedRole || isLoading
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                                    : theme === 'dark'
                                        ? 'bg-teal-500 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30 active:scale-95 text-white'
                                        : 'bg-teal-400 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-400/30 active:scale-95 text-white'
                            }`}
                        >
                            Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'User'}
                        </button>
                        <div className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-teal-100 font-medium'}`}>
                            Already have an account?{' '}
                            <Link href="/auth/login" className={`hover:underline transition-colors ${theme === 'dark' ? 'text-neon' : 'text-white hover:text-white font-semibold'}`}>Sign In</Link>
                        </div>
                    </div>
                )}
                {/* STEP 2: Form Details */}
                {currentStep === 2 && (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {formError && (
                            <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                                {formError}
                            </div>
                        )}

                        <div className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-teal-100'}`}>
                            Registering as <span className="font-semibold text-teal-200 capitalize">{selectedRole}</span>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Username</label>
                            <Input
                                icon={<FaUser className='text-teal-200' />}
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Pick a unique username"
                                className="text-teal-200 placeholder-teal-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Full Name</label>
                            <Input
                                icon={<FaUser className='text-teal-200' />}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="text-teal-200 placeholder-teal-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Email</label>
                            <Input
                                icon={<FaEnvelope className='text-teal-200' />}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="text-teal-200 placeholder-teal-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Phone Number</label>
                            <Input
                                icon={<FaPhone className='text-teal-200' />}
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="text-teal-200 placeholder-teal-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Date of Birth</label>
                            <Input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="text-teal-200 placeholder-teal-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Password</label>
                            <Input
                                icon={<FaLock className='text-teal-200' />}
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter a strong password"
                                className="text-teal-200 placeholder-teal-200 pr-8"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Confirm Password</label>
                            <Input
                                icon={<FaLock className='text-teal-200' />}
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="text-teal-200 placeholder-teal-200 pr-8"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/20 hover:bg-white/30 text-teal-50'}`}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                                    isLoading
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : theme === 'dark'
                                            ? 'bg-teal-500 hover:bg-teal-600 text-white'
                                            : 'bg-teal-400 hover:bg-teal-500 text-white'
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Register'}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3: Company Selection (Recruiter Only) */}
                {currentStep === 3 && selectedRole === 'recruiter' && (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {formError && (
                            <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                                {formError}
                            </div>
                        )}

                        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-teal-50'}`}>
                            Which company are you recruiting for?
                        </h3>

                        <div className="relative">
                            <label className="block text-gray-300 text-sm mb-1">Select Company</label>
                            <div
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-white/5 border-teal-300/30 hover:border-teal-300/60' : 'bg-white/10 border-teal-200/40 hover:border-teal-200/70'}`}
                                onClick={() => setShowCompanyDropdown(prev => !prev)}
                            >
                                <FaBuilding className="text-teal-200" />
                                <span className={`flex-1 ${formData.companyId ? 'text-teal-200' : 'text-teal-200/70'}`}>
                                    {formData.companyId ? companies.find(c => c.id === formData.companyId)?.name : 'Select a company...'}
                                </span>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setShowCompanyModal(true); }} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 transition-colors">
                                    <FaPlus /> New
                                </button>
                            </div>
                            {showCompanyDropdown && (
                                <div className={`absolute z-50 mt-2 w-full rounded-lg border ${theme === 'dark' ? 'bg-gray-900 border-teal-300/30' : 'bg-white/80 border-teal-200/40'} shadow-xl`}
                                         onMouseLeave={() => setShowCompanyDropdown(false)}>
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                                        <FaSearch className="text-teal-200" />
                                        <input
                                            className={`w-full bg-transparent outline-none ${theme === 'dark' ? 'text-teal-200' : 'text-teal-900'}`}
                                            placeholder="Search companies..."
                                            value={companySearch}
                                            onChange={(e) => setCompanySearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {filteredCompanies.length > 0 ? (
                                            filteredCompanies.map(company => (
                                                <button
                                                    key={company.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, companyId: company.id }));
                                                        setShowCompanyDropdown(false);
                                                        setCompanySearch('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-teal-50'}`}
                                                >
                                                    <p className={`text-sm ${theme === 'dark' ? 'text-teal-200' : 'text-teal-900'}`}>{company.name}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className={`px-3 py-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-teal-600'}`}>
                                                No companies found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/20 hover:bg-white/30 text-teal-50'}`}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                                    isLoading
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : theme === 'dark'
                                            ? 'bg-teal-500 hover:bg-teal-600 text-white'
                                            : 'bg-teal-400 hover:bg-teal-500 text-white'
                                }`}
                            >
                                {isLoading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Create Company Modal */}
                {showCompanyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
                        <div className={`w-full max-w-lg rounded-xl border ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'} p-6`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Company</h4>
                                <button type="button" onClick={() => setShowCompanyModal(false)} className="text-2xl text-gray-400 hover:text-gray-300">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <Input type="text" placeholder="Company Name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
                                <Input type="email" placeholder="Company Email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
                                <Input type="tel" placeholder="Company Phone" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                                <Input type="text" placeholder="Company Website" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} />
                                <Input type="text" placeholder="Company Address" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
                                <Input type="text" placeholder="Logo URL" value={companyForm.logoUrl} onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })} />
                                <textarea
                                    className={`w-full rounded px-4 py-2 outline-none text-sm resize-none ${theme === 'dark' ? 'bg-white/5 text-teal-200 border border-white/10' : 'bg-white text-gray-700 border border-gray-200'}`}
                                    placeholder="Company Description"
                                    value={companyForm.description}
                                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowCompanyModal(false)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const res = await apiClient.post<any>('/auth-service/api/company/register', companyForm);
                                            const newCompanyId = res?.id || res?.companyId || Math.random().toString(36).substring(7);
                                            setCompanies(prev => [...prev, { id: newCompanyId, name: companyForm.name }]);
                                            setFormData(prev => ({ ...prev, companyId: newCompanyId }));
                                            setCompanyForm({ name: '', email: '', phone: '', website: '', address: '', logoUrl: '', description: '' });
                                            setShowCompanyModal(false);
                                        } catch (err) {
                                            setFormError('Failed to create company: ' + (err instanceof Error ? err.message : 'Unknown error'));
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-teal-400 hover:bg-teal-500 text-white'}`}
                                >
                                    Create Company
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </GlassmorphicCard>
        </>
    );
}
