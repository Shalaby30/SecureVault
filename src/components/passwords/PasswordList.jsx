import { Eye, EyeOff, Copy, Star, Edit, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { toast } from "../../lib/use-toast"

const PasswordList = ({
  passwords,
  showPasswords,
  onToggleFavorite,
  onEdit,
  onDelete,
  onToggleVisibility
}) => {
  const copyToClipboard = (text, type = "text") => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `The ${type} has been copied to your clipboard.`,
    })
  }

  if (passwords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No passwords found. Add your first password to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {passwords.map((password) => (
        <div 
          key={password.id} 
          className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-blue-500 transition-colors"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{password.title}</h3>
                <p className="text-sm text-gray-400">{password.username || 'No username'}</p>
              </div>
              <button
                onClick={() => onToggleFavorite(password.id, password.favorite)}
                className="text-gray-400 hover:text-yellow-400 focus:outline-none"
              >
                <Star className={`h-5 w-5 ${password.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1 mr-2">
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={password.password}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-800 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onToggleVisibility()}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(password.password, 'password')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                title="Copy password"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            
            {password.website && (
              <div className="mt-3 flex items-center">
                <a
                  href={password.website.startsWith('http') ? password.website : `https://${password.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate"
                  title={password.website}
                >
                  {password.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {password.category || 'uncategorized'}
              </Badge>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(password)}
                  className="text-gray-400 hover:text-blue-400"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(password)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PasswordList
