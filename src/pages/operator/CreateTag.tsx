// src/pages/operator/CreateTag.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, 
  X, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Search,
  ChevronDown,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockCategories, mockMachines } from '@/lib/mockData';

interface FormData {
  categoryId: string;
  machineId: string;
  description: string;
}

interface FormErrors {
  categoryId?: string;
  machineId?: string;
  description?: string;
}

// Generate mock Tag ID based on current date
const generateTagId = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const sequence = '0013'; // Mock sequence number
  return `ANO-${year}${month}${day}-${sequence}`;
};

export const CreateTag: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    machineId: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [machineSearchTerm, setMachineSearchTerm] = useState('');
  
  // Refs for click outside
  const categoryRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);

  const tagId = useMemo(() => generateTagId(), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
      if (machineRef.current && !machineRef.current.contains(event.target as Node)) {
        setMachineDropdownOpen(false);
        setMachineSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on search term
  const filteredCategories = mockCategories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Filter machines based on search term
  const filteredMachines = mockMachines.filter(machine =>
    machine.name.toLowerCase().includes(machineSearchTerm.toLowerCase()) ||
    machine.code.toLowerCase().includes(machineSearchTerm.toLowerCase()) ||
    machine.department.toLowerCase().includes(machineSearchTerm.toLowerCase())
  );

  const validateField = (field: keyof FormData, value: string): string => {
    if (!value.trim()) {
      return `${field === 'categoryId' ? 'Category' : field === 'machineId' ? 'Machine/Location' : 'Description'} is required`;
    }
    if (field === 'description' && value.length < 10) {
      return 'Description must be at least 10 characters';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      categoryId: validateField('categoryId', formData.categoryId),
      machineId: validateField('machineId', formData.machineId),
      description: validateField('description', formData.description),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (validateForm()) {
      // Mock submission
      alert('Anomaly tag created successfully!');
      navigate('/my-tags');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`);
        return;
      }
      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        alert(`File ${file.name} must be JPG or PNG format`);
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result as string);
        if (validPreviews.length === validFiles.length) {
          setPreviews(prev => [...prev, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getFieldError = (field: keyof FormErrors) => {
    return submitted && errors[field];
  };

  const getSelectedCategory = () => {
    return mockCategories.find(c => c.id === formData.categoryId);
  };

  const getSelectedMachine = () => {
    return mockMachines.find(m => m.id === formData.machineId);
  };

  // Get display text for selected category
  const getCategoryDisplayText = () => {
    const selected = getSelectedCategory();
    if (selected) {
      return `${selected.code} — ${selected.name}`;
    }
    return '';
  };

  // Get display text for selected machine
  const getMachineDisplayText = () => {
    const selected = getSelectedMachine();
    if (selected) {
      return `${selected.code} — ${selected.name} · ${selected.department}`;
    }
    return '';
  };

  const descriptionLength = formData.description.length;
  const isDescriptionValid = descriptionLength >= 10;
  const isDescriptionTooShort = descriptionLength > 0 && descriptionLength < 10;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-gray-400">Create Tag</span>
      </nav>

      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-gray-600 hover:text-orange-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Report New Anomaly</h1>
          <p className="text-gray-500 mt-1">
            Fill in all required fields to submit an anomaly tag
          </p>
        </div>
      </div>

      {/* Form - Centered with max width */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tag ID - Readonly */}
            <div className="space-y-2">
              <Label htmlFor="tagId" className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-gray-400" />
                Tag ID
              </Label>
              <input
                id="tagId"
                type="text"
                value={tagId}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-600"
              />
              <p className="text-xs text-gray-400">
                Auto-generated — cannot be edited
              </p>
            </div>

            {/* Category - Searchable Select */}
            <div className="space-y-2" ref={categoryRef}>
              <Label htmlFor="category">
                Problem Category <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div
                  className={`relative flex items-center border rounded-lg transition-colors cursor-pointer ${
                    getFieldError('categoryId')
                      ? 'border-red-500'
                      : 'border-gray-200 hover:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500'
                  }`}
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <div className="flex-1 px-9 py-3 min-h-[48px] flex items-center">
                    {getCategoryDisplayText() ? (
                      <span className="text-sm">{getCategoryDisplayText()}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Select a category...</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryDropdownOpen(!categoryDropdownOpen);
                    }}
                    className="absolute right-3"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {formData.categoryId && !getFieldError('categoryId') && (
                    <CheckCircle className="absolute right-10 w-4 h-4 text-green-500 pointer-events-none" />
                  )}
                </div>
                
                {categoryDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search category..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, categoryId: cat.id });
                            setCategoryDropdownOpen(false);
                            setCategorySearchTerm('');
                            if (submitted) validateForm();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium">{cat.code} — {cat.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-sm text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {getFieldError('categoryId') && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.categoryId}
                </p>
              )}
              
              {getSelectedCategory() && !getFieldError('categoryId') && (
                <p className="text-xs text-gray-500 italic animate-in fade-in-50">
                  {getSelectedCategory()?.description}
                </p>
              )}
            </div>

            {/* Machine/Location - Searchable Select */}
            <div className="space-y-2" ref={machineRef}>
              <Label htmlFor="machine">
                Machine / Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div
                  className={`relative flex items-center border rounded-lg transition-colors cursor-pointer ${
                    getFieldError('machineId')
                      ? 'border-red-500'
                      : 'border-gray-200 hover:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500'
                  }`}
                  onClick={() => setMachineDropdownOpen(!machineDropdownOpen)}
                >
                  <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <div className="flex-1 px-9 py-3 min-h-[48px] flex items-center">
                    {getMachineDisplayText() ? (
                      <span className="text-sm">{getMachineDisplayText()}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Select a machine or location...</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMachineDropdownOpen(!machineDropdownOpen);
                    }}
                    className="absolute right-3"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {formData.machineId && !getFieldError('machineId') && (
                    <CheckCircle className="absolute right-10 w-4 h-4 text-green-500 pointer-events-none" />
                  )}
                </div>
                
                {machineDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search machine..."
                          value={machineSearchTerm}
                          onChange={(e) => setMachineSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredMachines.map((machine) => (
                        <button
                          key={machine.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, machineId: machine.id });
                            setMachineDropdownOpen(false);
                            setMachineSearchTerm('');
                            if (submitted) validateForm();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium">{machine.code} — {machine.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">Department: {machine.department}</p>
                        </button>
                      ))}
                      {filteredMachines.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-sm text-center">
                          No machines found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {getFieldError('machineId') && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.machineId}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="description"
                  placeholder="Describe the anomaly in detail. What did you observe? When did it start? Any unusual sounds or smells?"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (submitted) validateForm();
                  }}
                  rows={6}
                  className={`resize-none transition-colors ${
                    getFieldError('description')
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : isDescriptionValid && descriptionLength > 0
                      ? 'border-green-500'
                      : ''
                  }`}
                />
                {isDescriptionValid && descriptionLength > 0 && (
                  <CheckCircle className="absolute bottom-3 right-3 w-4 h-4 text-green-500" />
                )}
              </div>
              
              {getFieldError('description') && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
              
              <div className="flex justify-end">
                <span className={`text-xs ${
                  isDescriptionTooShort 
                    ? 'text-red-500' 
                    : isDescriptionValid && descriptionLength > 0
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}>
                  {descriptionLength} / 1000
                  {isDescriptionTooShort && ' (minimum 10 characters)'}
                </span>
              </div>
            </div>

            {/* Photos Upload */}
            <div className="space-y-2">
              <Label>
                Photos <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer"
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Tap to take photo or upload from gallery</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5 photos · 5MB each · JPG, PNG only</p>
                </label>
              </div>
              
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl text-base font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Anomaly Tag
              </Button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Tag will be submitted for supervisor review and prioritization
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};