'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/common/label';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import { PlusCircle, Trash2, User, Upload } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { toast } from 'sonner';
import { Contact } from '@/types/temp';
import {
  fetchAvatar,
  fetchProfileInfo,
  updateAvatar,
  updateProfileInfo,
} from '@/lib/api/profile';
import { addContact, deleteContact, fetchContacts } from '@/lib/api/contacts';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettings() {
  // State for loading indicators
  const [isLoading, setIsLoading] = useState({
    profile: true,
    avatar: true,
    contacts: true,
  });

  // Profile picture state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isDeletingContact, setIsDeletingContact] = useState<number | null>(
    null,
  );

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      location: '',
    },
  });

  // Fetch avatar on component mount
  useEffect(() => {
    async function loadAvatar() {
      try {
        const url = await fetchAvatar();
        setAvatarUrl(url);
      } catch (error) {
        console.error('Failed to load avatar:', error);
        toast('Failed to load avatar. Please try again later.');
      } finally {
        setIsLoading((prev) => ({ ...prev, avatar: false }));
      }
    }

    loadAvatar();
  }, []);

  // Fetch profile info on component mount
  useEffect(() => {
    async function loadProfileInfo() {
      try {
        const profile = await fetchProfileInfo();

        // Update form values with fetched data
        form.reset({
          username: profile.username,
          name: profile.name,
          email: profile.email,
          location: profile.location || '',
        });

        // If we haven't already set the avatar from fetchAvatar, use the one from profile
        if (!avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to load profile info:', error);
        toast('Failed to load profile information. Please try again later.');
      } finally {
        setIsLoading((prev) => ({ ...prev, profile: false }));
      }
    }

    loadProfileInfo();
  }, [avatarUrl, form]);

  // Fetch contacts on component mount
  useEffect(() => {
    async function loadContacts() {
      try {
        const contactsList = await fetchContacts();
        setContacts(contactsList);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        toast('Failed to load contacts. Please try again later.');
      } finally {
        setIsLoading((prev) => ({ ...prev, contacts: false }));
      }
    }

    loadContacts();
  }, []);

  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfileInfo(data);
      toast('Your profile has been updated successfully.');
    } catch (error: unknown) {
      if (error) {
        toast('Failed to update profile. Please try again later.');
      }
    }
  }

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  // Handle avatar update
  const handleAvatarUpdate = async () => {
    if (!selectedImage) return;

    setIsUploadingAvatar(true);
    try {
      const newAvatarUrl = await updateAvatar(selectedImage);
      setAvatarUrl(newAvatarUrl);
      toast('Your profile picture has been updated successfully.');
    } catch (error) {
      if (error) {
        toast('Failed to update profile picture. Please try again later.');
      }
    } finally {
      setIsUploadingAvatar(false);
      setSelectedImage(null);
    }
  };

  // Handle adding a contact
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) return;

    setIsAddingContact(true);
    try {
      const addedContact = await addContact(newContact);
      setContacts([...contacts, addedContact]);
      setNewContact({ name: '', email: '', phone: '' });
      setShowContactForm(false);
      toast('The contact has been added successfully.');
    } catch (error) {
      if (error) {
        toast('Failed to add contact. Please try again later.');
      }
    } finally {
      setIsAddingContact(false);
    }
  };

  // Handle deleting a contact
  const handleDeleteContact = async (id: number) => {
    setIsDeletingContact(id);
    try {
      await deleteContact(id);
      setContacts(contacts.filter((contact) => contact.id !== id));
      toast('The contact has been deleted successfully.');
    } catch (error) {
      if (error) {
        toast('Failed to delete contact. Please try again later.');
      }
    } finally {
      setIsDeletingContact(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a new profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer">
                {isLoading.avatar ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <span className="animate-pulse">Loading...</span>
                  </div>
                ) : (
                  <>
                    <AvatarImage
                      src={avatarUrl || '/placeholder.svg'}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {form.getValues('name')
                        ? form.getValues('name').charAt(0).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </>
                )}
                <Label
                  htmlFor="picture"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-white" />
                </Label>
              </Avatar>
              <input
                id="picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="space-y-2 flex-1">
              <div className="text-sm text-muted-foreground">
                Recommended: Square JPG, PNG, or GIF, at least 400x400 pixels.
              </div>
              <Button
                onClick={handleAvatarUpdate}
                disabled={!selectedImage || isUploadingAvatar}
              >
                {isUploadingAvatar ? 'Saving...' : 'Save profile picture'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading.profile ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading.profile}>
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Contacts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Manage your contacts list.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContactForm(!showContactForm)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showContactForm && (
            <Card className="border-dashed border-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <Input
                      id="contactName"
                      placeholder="Contact name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@example.com"
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contactPhone">Phone (optional)</Label>
                    <Input
                      id="contactPhone"
                      placeholder="Phone number"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                    disabled={isAddingContact}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddContact}
                    disabled={
                      !newContact.name || !newContact.email || isAddingContact
                    }
                  >
                    {isAddingContact ? 'Saving...' : 'Save Contact'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading.contacts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No contacts yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first contact to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="text-sm text-muted-foreground">
                        {contact.phone}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={isDeletingContact === contact.id}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    {isDeletingContact === contact.id ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete contact</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
