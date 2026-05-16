import { useState, useEffect, useRef } from 'react'
import { profilesApi, type Profile } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Upload } from 'lucide-react'

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    profilesApi.getMyProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const newProfile = await profilesApi.upload(file)
      setProfile(newProfile)
      setUploadMsg('Resume uploaded! AI extraction is processing — refresh in a few seconds to see your skills.')
    } catch {
      setUploadMsg('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading profile...</p>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Your skills and experience</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </div>
      </div>

      {uploadMsg && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
          {uploadMsg}
        </div>
      )}

      {!profile ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No profile yet. Upload your resume to get started.</p>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>Upload Resume (PDF)</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={profile.status === 'approved' ? 'success' : profile.status === 'pending' ? 'warning' : 'destructive'}>
              {profile.status}
            </Badge>
          </div>

          {profile.summary && (
            <Card>
              <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-relaxed">{profile.summary}</p></CardContent>
            </Card>
          )}

          {profile.profileSkills?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.profileSkills.map(ps => (
                    <div key={ps.id} className="flex items-center gap-1.5 border rounded-full px-3 py-1 text-sm">
                      <span className="font-medium">{ps.skill.name}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="text-muted-foreground capitalize">{ps.proficiency}</span>
                      {ps.yearsExperience && <span className="text-muted-foreground">{ps.yearsExperience}yr</span>}
                      {ps.inferred && <Badge variant="warning" className="text-xs py-0">inferred</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.projects?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Projects</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {profile.projects.map(p => (
                  <div key={p.id} className="rounded-lg bg-muted/40 p-4">
                    <p className="font-medium mb-1">{p.title}</p>
                    <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                    {p.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.technologies.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
