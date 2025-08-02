import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, CheckCircle } from 'lucide-react';
import BusinessRegisterSteps from '@/components/auth/BusinessRegisterSteps';

const BusinessRegisterPage = () => {
  return (
    <BusinessRegisterSteps />
  );
};

export default BusinessRegisterPage; 