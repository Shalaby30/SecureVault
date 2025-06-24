import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPasswords, addPassword, updatePassword, deletePassword } from '../../lib/passwordService';
import { toast } from '../../lib/use-toast';
import PasswordList from './PasswordList';
import PasswordForm from './PasswordForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Eye, EyeOff, Key } from 'lucide-react';

const PasswordManager = ({ user }) => {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(null);

  // Load passwords from the database
  const loadPasswords = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const data = await getPasswords(user.uid);
      setPasswords(data || []);
    } catch (error) {
      console.error('Error loading passwords:', error);
      toast({
        title: 'Error',
        description: 'Failed to load passwords. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load passwords on component mount and when user changes
  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  // Filter passwords based on search query and category
  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (password.username && password.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (password.website && password.website.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPasswords(prev => !prev);
  };

  // Handle adding a new password
  const handleAddPassword = async (passwordData) => {
    try {
      await addPassword(user.uid, {
        ...passwordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
      });
      
      await loadPasswords();
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Password added successfully!',
      });
    } catch (error) {
      console.error('Error adding password:', error);
      toast({
        title: 'Error',
        description: 'Failed to add password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle updating a password
  const handleUpdatePassword = async (passwordData) => {
    try {
      await updatePassword(user.uid, passwordData.id, {
        ...passwordData,
        updatedAt: new Date().toISOString(),
      });
      
      await loadPasswords();
      setCurrentPassword(null);
      
      toast({
        title: 'Success',
        description: 'Password updated successfully!',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a password
  const handleDeletePassword = async () => {
    if (!currentPassword) return;
    
    try {
      await deletePassword(user.uid, currentPassword.id);
      await loadPasswords();
      
      setIsDeleteDialogOpen(false);
      setCurrentPassword(null);
      
      toast({
        title: 'Success',
        description: 'Password deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Toggle favorite status of a password
  const toggleFavorite = async (passwordId, currentStatus) => {
    try {
      const password = passwords.find(p => p.id === passwordId);
      if (!password) return;
      
      await updatePassword(user.uid, passwordId, {
        ...password,
        favorite: !currentStatus,
        updatedAt: new Date().toISOString(),
      });
      
      await loadPasswords();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status.',
        variant: 'destructive',
      });
    }
  };

  // Get unique categories from passwords
  const categories = ['all', ...new Set(passwords.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Passwords</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading 
                ? 'Loading your passwords...' 
                : `Showing ${filteredPasswords.length} of ${passwords.length} passwords`}
            </p>
          </div>
        
          <div className="w-full md:w-auto space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-3">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="search"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePasswordVisibility}
                className="flex items-center space-x-1.5 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Show</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setCurrentPassword(null);
                  setIsAddDialogOpen(true);
                }}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Password</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Password List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No passwords found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first password</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          </div>
        ) : (
          <PasswordList
            passwords={filteredPasswords}
            showPasswords={showPasswords}
            onEdit={(password) => {
              setCurrentPassword(password);
              setIsAddDialogOpen(true);
            }}
            onDelete={(password) => {
              setCurrentPassword(password);
              setIsDeleteDialogOpen(true);
            }}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>

      {/* Add/Edit Password Dialog */}
      <PasswordForm
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setCurrentPassword(null);
        }}
        onSubmit={currentPassword ? handleUpdatePassword : handleAddPassword}
        initialData={currentPassword}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
                Delete Password
              </h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">{currentPassword?.title}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setCurrentPassword(null);
                  }}
                  className="px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeletePassword}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordManager;
