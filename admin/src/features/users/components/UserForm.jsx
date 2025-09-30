import React, { useEffect, useState } from 'react'
import Form from '../../../shared/components/ui/Form'
import { formatPermissionsForDisplay } from '../../roles/constants/permissionDefinitions'

const buildInitialProfile = (user) => {
  if (!user || !user.profile) {
    return { firstName: '', lastName: '', dateOfBirth: '', pictureUrl: '' }
  }
  return {
    firstName: user.profile.firstName || '',
    lastName: user.profile.lastName || '',
    dateOfBirth: user.profile.dateOfBirth || '',
    pictureUrl: user.profile.pictureUrl || '',
  }
}

export function UserForm({ onSubmit, initialUser, onCancel, errors = {}, submitting = false, formId = 'user-form', roleOptions = [], rolesLoading = false }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [pictureData, setPictureData] = useState('')
  const [picturePreview, setPicturePreview] = useState('')
  const [pictureLoading, setPictureLoading] = useState(false)
  const [pictureLocalError, setPictureLocalError] = useState(null)
  const [roles, setRoles] = useState([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localPasswordError, setLocalPasswordError] = useState(null)

  useEffect(() => {
    const profile = buildInitialProfile(initialUser)
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setEmail(initialUser?.email || '')
    setDateOfBirth(profile.dateOfBirth || '')
    setPictureData(profile.pictureUrl || '')
    setPicturePreview(profile.pictureUrl || '')
    setPictureLocalError(null)
    setRoles(Array.isArray(initialUser?.roles) ? initialUser.roles.map(String) : [])
    setPassword('')
    setConfirmPassword('')
    setLocalPasswordError(null)
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalPasswordError(null)
    const roleIds = roles.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    if (pictureLoading) return

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roles: roleIds,
      pictureUrl: pictureData || undefined,
      dateOfBirth: dateOfBirth || undefined,
    }
    const isEditing = !!initialUser?.id
    if (isEditing && (password || confirmPassword)) {
      if (password !== confirmPassword) {
        setLocalPasswordError('Password confirmation does not match')
        return
      }
      if (password.length < 6) {
        setLocalPasswordError('Password must be at least 6 characters')
        return
      }
      payload.password = password
    }
    onSubmit(payload)
  }

  const isEditing = !!initialUser?.id

  const firstNameError = typeof errors.firstName === 'string' ? errors.firstName : errors.firstName?.message
  const lastNameError = typeof errors.lastName === 'string' ? errors.lastName : errors.lastName?.message
  const emailError = typeof errors.email === 'string' ? errors.email : errors.email?.message
  const dobError = typeof errors.dateOfBirth === 'string' ? errors.dateOfBirth : errors.dateOfBirth?.message
  const pictureError = pictureLocalError || (typeof errors.pictureUrl === 'string' ? errors.pictureUrl : errors.pictureUrl?.message)
  const rolesError = typeof errors.roles === 'string' ? errors.roles : errors.roles?.message
  const passwordServerError = typeof errors.password === 'string' ? errors.password : errors.password?.message
  const passwordError = localPasswordError || passwordServerError

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Basic Information Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-user mr-2 text-blue-600"></i>
          Basic Information
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Group>
            <Form.Label htmlFor="firstName">
              <i className="fas fa-signature mr-2"></i>
              First Name
            </Form.Label>
            <Form.Control
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
              disabled={submitting}
              className={firstNameError ? 'border-red-500' : ''}
            />
            {firstNameError && <Form.Error>{firstNameError}</Form.Error>}
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="lastName">
              <i className="fas fa-signature mr-2"></i>
              Last Name
            </Form.Label>
            <Form.Control
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
              disabled={submitting}
              className={lastNameError ? 'border-red-500' : ''}
            />
            {lastNameError && <Form.Error>{lastNameError}</Form.Error>}
          </Form.Group>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Form.Group>
            <Form.Label htmlFor="email">
              <i className="fas fa-envelope mr-2"></i>
              Email Address
            </Form.Label>
            <Form.Control
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={submitting}
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && <Form.Error>{emailError}</Form.Error>}
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="dateOfBirth">
              <i className="fas fa-birthday-cake mr-2"></i>
              Date of Birth
            </Form.Label>
            <Form.Control
              id="dateOfBirth"
              type="date"
              value={dateOfBirth || ''}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={submitting}
              className={dobError ? 'border-red-500' : ''}
            />
            {dobError && <Form.Error>{dobError}</Form.Error>}
          </Form.Group>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-image mr-2 text-blue-600"></i>
          Profile Picture
        </h6>
        <Form.Group>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {picturePreview ? (
                  <img
                    src={picturePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <i className="fas fa-user text-2xl"></i>
                    <div className="text-xs mt-1">No Image</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${pictureError ? 'border-red-500' : ''}`}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) {
                      setPictureData('')
                      setPicturePreview('')
                      setPictureLocalError(null)
                      return
                    }
                    if (!file.type.startsWith('image/')) {
                      setPictureLocalError('Please select an image file')
                      return
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPictureLocalError('Image must be 5MB or smaller')
                      return
                    }
                    setPictureLocalError(null)
                    setPictureLoading(true)
                    try {
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result
                        if (typeof result === 'string') {
                          setPictureData(result)
                          setPicturePreview(result)
                        }
                        setPictureLoading(false)
                      }
                      reader.onerror = () => {
                        setPictureLocalError('Failed to read image file')
                        setPictureLoading(false)
                      }
                      reader.readAsDataURL(file)
                    } catch (err) {
                      console.error(err)
                      setPictureLocalError('Failed to process image')
                      setPictureLoading(false)
                    }
                  }}
                  disabled={submitting}
                />
                <div className="text-sm text-gray-500">
                  <i className="fas fa-upload mr-1"></i>
                  Choose Image (Max 5MB)
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  type="button"
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => {
                    setPictureData('')
                    setPicturePreview('')
                    setPictureLocalError(null)
                  }}
                  disabled={submitting || (!pictureData && !picturePreview)}
                >
                  <i className="fas fa-trash mr-1"></i>
                  Remove
                </button>
                {pictureLoading && (
                  <span className="text-sm text-blue-600">
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Uploading...
                  </span>
                )}
              </div>
              {pictureError && (
                <div className="text-sm text-red-600 mt-1">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {pictureError}
                </div>
              )}
            </div>
          </div>
        </Form.Group>
      </div>

      {/* Roles & Permissions Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-shield-alt mr-2 text-blue-600"></i>
          Roles & Permissions
        </h6>

        <Form.Group>
          <Form.Label>
            <i className="fas fa-user-tag mr-2 text-blue-600"></i>
            Assign Roles
          </Form.Label>

          <div className="space-y-3">
            {rolesLoading ? (
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
                  <p className="text-gray-600">Loading available roles...</p>
                </div>
              </div>
            ) : !roleOptions.length ? (
              <div className="flex items-center justify-center py-8 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                <div className="text-center">
                  <i className="fas fa-exclamation-triangle text-2xl text-yellow-600 mb-2"></i>
                  <p className="text-yellow-800 font-medium">No roles available</p>
                  <p className="text-yellow-600 text-sm">You may not have permission to view roles or no roles exist yet.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {roleOptions.map(role => {
                  const isSelected = roles.includes(String(role.id))
                  return (
                    <div
                      key={role.id}
                      className={`group relative border rounded-xl transition-all duration-200 ${isSelected
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        } ${rolesError ? 'border-red-300' : ''}`}
                    >
                      <label className="flex items-start p-5 cursor-pointer">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRoles([...roles, String(role.id)])
                              } else {
                                setRoles(roles.filter(r => r !== String(role.id)))
                              }
                            }}
                            disabled={submitting}
                          />
                          <div className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                            ? 'border-blue-600 bg-blue-600 shadow-sm'
                            : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isSelected
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                                } transition-colors duration-200`}>
                                <i className="fas fa-user-shield text-lg"></i>
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold transition-colors duration-200 ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                  {role.name}
                                </h3>
                                <p className={`text-sm transition-colors duration-200 ${isSelected ? 'text-blue-700' : 'text-gray-600'
                                  }`}>
                                  Role Assignment
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center text-blue-600">
                                <span className="text-sm font-medium mr-2">Selected</span>
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <i className="fas fa-check text-xs"></i>
                                </div>
                              </div>
                            )}
                          </div>

                          {role.permissions && role.permissions.length > 0 && (
                            <div className="mt-4 pl-13">
                              <div className="flex items-center mb-2">
                                <i className="fas fa-key text-xs text-gray-500 mr-2"></i>
                                <span className="text-sm font-medium text-gray-700">Permissions:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {formatPermissionsForDisplay(role.permissions).map((permission, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${isSelected
                                      ? 'bg-blue-200 text-blue-800'
                                      : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-800'
                                      }`}
                                  >
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!role.permissions || role.permissions.length === 0) && (
                            <div className="mt-4 pl-13">
                              <div className="flex items-center text-gray-500">
                                <i className="fas fa-info-circle text-xs mr-2"></i>
                                <span className="text-sm">No specific permissions assigned</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!rolesLoading && roleOptions.length > 0 && (
            <Form.Help>
              <i className="fas fa-lightbulb mr-1"></i>
              Select one or more roles to assign to this user. Each role grants specific permissions.
            </Form.Help>
          )}

          {rolesError && (
            <Form.Error>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {rolesError}
            </Form.Error>
          )}
        </Form.Group>
      </div>

      {/* Password Section (only for editing) */}
      {isEditing && (
        <div>
          <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-lock mr-2 text-blue-600"></i>
            Change Password
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Group>
              <Form.Label htmlFor="newPassword">
                <i className="fas fa-key mr-2"></i>
                New Password
              </Form.Label>
              <Form.Control
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (localPasswordError) setLocalPasswordError(null)
                }}
                placeholder="Leave blank to keep current password"
                disabled={submitting}
                className={passwordError ? 'border-red-500' : ''}
              />
              {passwordError && <Form.Error>{passwordError}</Form.Error>}
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="confirmPassword">
                <i className="fas fa-key mr-2"></i>
                Confirm Password
              </Form.Label>
              <Form.Control
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (localPasswordError) setLocalPasswordError(null)
                }}
                placeholder="Re-enter new password"
                disabled={submitting}
                className={passwordError ? 'border-red-500' : ''}
              />
            </Form.Group>
          </div>
        </div>
      )}
    </form>
  )
}

export default UserForm;