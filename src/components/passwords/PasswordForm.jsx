import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { generatePassword } from '../../lib/utils';
import { toast } from '../../lib/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const PasswordForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    username: '',
    password: '',
    website: '',
    notes: '',
    category: 'Personal',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        email: initialData.email || '',
        username: initialData.username || '',
        password: initialData.password || '',
        website: initialData.website || '',
        notes: initialData.notes || '',
        category: initialData.category || 'Personal',
      });
    }
  }, [initialData]);

  const handleGeneratePassword = () => {
    setIsGenerating(true);
    const password = generatePassword(16);
    setFormData(prev => ({
      ...prev,
      password
    }));
    navigator.clipboard.writeText(password);
    toast({
      title: "Password generated and copied",
      description: "The generated password has been copied to your clipboard.",
    });
    setIsGenerating(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive"
      });
      return;
    }

    onSave({ ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Facebook"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Finance">Finance</option>
          <option value="Social">Social</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGeneratePassword}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
            https://
          </span>
          <Input
            id="website"
            name="website"
            type="text"
            value={formData.website.replace(/^https?:\/\//, '')}
            onChange={(e) => {
              const value = e.target.value.replace(/^https?:\/\//, '')
              setFormData(prev => ({
                ...prev,
                website: value ? `https://${value}` : ''
              }))
            }}
            placeholder="example.com"
            className="rounded-l-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional information about this password"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Password
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
