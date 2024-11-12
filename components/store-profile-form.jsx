'use client'

import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Trash, Plus, X, Image as ImageIcon } from "@phosphor-icons/react"
import Loading from "./ui/loading"

export default function StoreProfileForm() {
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [storeData, setStoreData] = useState({
    storeName: "",
    logo: "",
    address: "",
    mobileNumbers: [{
      name: "",
      number: ""
    }],
    terms: ""
  })

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    try {
      const response = await fetch('/api/store')
      if (!response.ok) throw new Error('Failed to fetch store data')

      const data = await response.json()
      if (data) {
        const formattedData = {
          ...data,
          mobileNumbers: data.mobileNumbers?.length > 0
            ? data.mobileNumbers.map(num => typeof num === 'string'
              ? { name: '', number: num }
              : num)
            : [{ name: '', number: '' }]
        }
        setStoreData(formattedData)
        if (formattedData.logo) {
          setPreviewUrl(formattedData.logo)
        }
      }
    } catch (error) {
      console.error('Error fetching store data:', error)
      toast.error("Failed to fetch store data")
    } finally {
      setIsInitialLoading(false)
    }
  }

  if (isInitialLoading) return <Loading type="color" />

  const isLastEntryComplete = () => {
    const lastEntry = storeData.mobileNumbers[storeData.mobileNumbers.length - 1]
    return lastEntry.name.trim() !== "" && lastEntry.number.trim() !== ""
  }

  const handleAddNumber = () => {
    setStoreData(prev => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, { name: "", number: "" }]
    }))
  }

  const handleRemoveNumber = (index) => {
    if (storeData.mobileNumbers.length === 1) return
    setStoreData(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((_, i) => i !== index)
    }))
  }

  const handleNumberChange = (index, field, value) => {
    setStoreData(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storeData,
          mobileNumbers: storeData.mobileNumbers.filter(
            contact => contact.name.trim() !== '' || contact.number.trim() !== ''
          )
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update store details')
      }

      await fetchStoreData() // Refresh data after successful update
      toast.success("Store details updated successfully")
    } catch (error) {
      console.error('Error updating store details:', error)
      toast.error(error.message || "Failed to update store details")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setSelectedFile(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = async () => {
    if (!selectedFile) return

    setUploadLoading(true)

    try {
      const updatedData = {
        ...storeData,
        logo: selectedFile
      }

      const storeRes = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (!storeRes.ok) {
        const error = await storeRes.json()
        throw new Error(error.message || 'Failed to update store data')
      }

      setStoreData(updatedData)
      setSelectedFile(null)
      toast.success("Logo updated successfully")
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to update logo")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleClearLogo = async () => {
    try {
      const updatedData = {
        ...storeData,
        logo: ''
      }

      const response = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to clear logo')
      }

      setPreviewUrl(null)
      setSelectedFile(null)
      setStoreData(updatedData)
      toast.success("Logo cleared successfully")
    } catch (error) {
      toast.error(error.message || "Failed to clear logo")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="logo">Store Logo</Label>
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="h-40 w-full object-contain border rounded-lg bg-secondary"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                          type="button"
                          variant="destructiveGhost"
                          size="iconSmall"
                          className="absolute top-2 right-2 text-background bg-foreground hover:bg-destructive hover:text-foreground"
                          onClick={handleClearLogo}
                        >
                          <X />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent variant="destructive" >
                          Delete logo
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="h-40 w-full border-2 border-dashed rounded-lg flex items-center justify-center bg-secondary">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No logo uploaded</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="file:mr-4 file:px-4 file:h-10 p-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      disabled={uploadLoading}
                    />
                  </div>
                  {selectedFile && (
                    <Button
                      type="button"
                      {...(uploadLoading ? { size: 'icon' } : {})}
                      onClick={handleLogoUpload}
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (<Loading />) : "Save Logo"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={storeData.address}
                onChange={(e) => setStoreData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeData.storeName}
                onChange={(e) => setStoreData(prev => ({ ...prev, storeName: e.target.value }))}
                required
              />
            </div>

            {/* Mobile Numbers */}
            <div className="space-y-2">
              <Label>Contact Numbers</Label>
              {storeData.mobileNumbers.map((contact, index) => (
                <div key={index} className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleNumberChange(index, 'name', e.target.value)}
                        placeholder="Contact name"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="tel"
                        value={contact.number}
                        onChange={(e) => handleNumberChange(index, 'number', e.target.value)}
                        placeholder="Mobile number"
                        required
                      />
                    </div>
                    {storeData.mobileNumbers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNumber(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNumber}
                className="mt-2"
                disabled={!isLastEntryComplete()}
              >
                <Plus size={16} />
                Add Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <Label htmlFor="terms">Terms and Conditions</Label>
          <Textarea
            id="terms"
            value={storeData.terms}
            onChange={(e) => setStoreData(prev => ({ ...prev, terms: e.target.value }))}
            placeholder="Enter terms and conditions for bill"
            rows={4}
          />
        </div>

        <div className="pb-20 md:pb-0">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loading />
                Saving...
              </>
            ) : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}