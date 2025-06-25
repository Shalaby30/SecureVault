import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { generatePassword } from '../../lib/utils'
import { toast } from '../../lib/use-toast'

const PasswordForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    email: '',
    password: '',
    website: '',
    notes: '',
    category: 'Personal',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (initialData) {
      // If editing an existing password, set the form data
      setFormData({
        title: initialData.title || '',
        username: initialData.username || '',
        email: initialData.email || '',
        password: initialData.password || '',
        website: initialData.website || '',
        notes: initialData.notes || '',
        category: initialData.category || 'Personal',
      })
    } else {
      // If creating a new password, reset the form
      setFormData({
        title: '',
        username: '',
        email: '',
        password: '',
        website: '',
        notes: '',
        category: 'Personal',
      })
    }
  }, [initialData])

  const handleGeneratePassword = () => {
    setIsGenerating(true)
    // Generate a strong password with 16 characters
    const password = generatePassword(16)
    setFormData(prev => ({
      ...prev,
      password: password
    }))
    
    // Copy to clipboard
    navigator.clipboard.writeText(password)
    toast({
      title: "Password generated and copied",
      description: "The generated password has been copied to your clipboard.",
    })
    
    setIsGenerating(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      })
      return
    }
    if (!formData.password) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive"
      })
      return
    }
    
    // Create a new object with the form data
    const formDataToSave = { ...formData };
    
    // If both username and email are provided, save both
    // If only one is provided, save that one
    // This ensures we don't lose any data
    if (formData.email && formData.username) {
      // Both fields have values, save both
      formDataToSave.username = formData.username;
      formDataToSave.email = formData.email;
    } else if (formData.email) {
      // Only email is provided, save as username
      formDataToSave.username = formData.email;
      delete formDataToSave.email;
    } else if (formData.username) {
      // Only username is provided, save as is
      formDataToSave.username = formData.username;
      delete formDataToSave.email;
    } else {
      // No username or email provided
      formDataToSave.username = '';
      delete formDataToSave.email;
    }
    
    // Call the onSave callback with the form data
    onSave(formDataToSave)
  }

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

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Finance">Finance</option>
            <option value="Social">Social</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
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
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
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
  )
}

export default PasswordForm
