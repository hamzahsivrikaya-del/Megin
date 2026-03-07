'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import type { User, Package, Gender } from '@/lib/types'

type MemberWithPackages = User & { packages: Package[] }

export default function MembersList({ initialMembers }: { initialMembers: MemberWithPackages[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [members, setMembers] = useState(initialMembers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAddModal, setShowAddModal] = useState(searchParams.get('action') === 'new')

  // Yeni üye formu
  const [newMember, setNewMember] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    gender: '' as '' | Gender,
  })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'active' ? m.is_active : !m.is_active)
    return matchSearch && matchFilter
  })

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')

    // Manuel validation (native browser validation autofill ile çakışabiliyor)
    if (!newMember.full_name.trim()) {
      setAddError('Ad soyad girin')
      return
    }
    // Türkçe karakterleri ASCII'ye normalize et (ı→i, İ→I, ş→s, ç→c, ğ→g, ü→u, ö→o)
    const normalizedEmail = newMember.email.trim()
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .toLowerCase()

    if (!normalizedEmail) {
      setAddError('E-posta girin')
      return
    }
    if (!newMember.password || newMember.password.length < 6) {
      setAddError('Şifre en az 6 karakter olmalı')
      return
    }
    if (!newMember.gender) {
      setAddError('Cinsiyet seçin')
      return
    }

    setAdding(true)

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMember, email: normalizedEmail }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Üye eklenemedi')
      }

      setShowAddModal(false)
      setNewMember({ email: '', password: '', full_name: '', phone: '', gender: '' })
      router.refresh()
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl heading-display">Üyeler</h1>
        <Button onClick={() => setShowAddModal(true)}>Yeni Üye</Button>
      </div>

      {/* Arama ve filtre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${filter === f
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
            >
              {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Pasif'}
            </button>
          ))}
        </div>
      </div>

      {/* Üye listesi */}
      <div className="grid gap-3">
        {filteredMembers.length === 0 ? (
          <Card glow>
            <p className="text-text-secondary text-center py-4">Üye bulunamadı</p>
          </Card>
        ) : (
          filteredMembers.map((member) => {
            const activePackage = member.packages?.find((p) => p.status === 'active')
            const remaining = activePackage
              ? activePackage.total_lessons - activePackage.used_lessons
              : 0

            async function handleDelete() {
              if (!confirm(`${member.full_name} silinecek. Tüm verileri (paketler, dersler, ölçümler) de silinir. Emin misiniz?`)) return
              setDeleting(member.id)
              try {
                const res = await fetch('/api/admin/members', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: member.id }),
                })
                if (!res.ok) {
                  const data = await res.json()
                  alert(data.error || 'Silinemedi')
                }
                router.refresh()
              } catch {
                alert('Bir hata oluştu')
              } finally {
                setDeleting(null)
              }
            }

            return (
              <Card glow key={member.id} className="transition-colors">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/members/${member.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name}</span>
                      <Badge variant={member.is_active ? 'success' : 'default'}>
                        {member.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {member.parent_id && (
                        <Badge variant="default">Bağlı Üye</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {member.parent_id
                        ? `Bağlı: ${members.find(m => m.id === member.parent_id)?.full_name || '—'}`
                        : member.email
                      }
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {activePackage ? (
                        <>
                          <div className="text-sm font-medium">
                            {activePackage.used_lessons}/{activePackage.total_lessons} ders
                          </div>
                          <Badge variant={
                            remaining <= 0 ? 'danger'
                            : remaining / activePackage.total_lessons <= 0.25 ? 'danger'
                            : remaining / activePackage.total_lessons <= 0.5 ? 'warning'
                            : 'success'
                          }>
                            {remaining <= 0 ? 'Bitti' : `${remaining} kaldı`}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="default">Paket yok</Badge>
                      )}
                    </div>
                    <button
                      onClick={handleDelete}
                      disabled={deleting === member.id}
                      className="text-text-secondary hover:text-danger transition-colors p-1 cursor-pointer"
                      title="Üyeyi Sil"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Yeni üye modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Üye Ekle">
        <form onSubmit={handleAddMember} noValidate className="space-y-4">
          <Input
            label="Ad Soyad"
            value={newMember.full_name}
            onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
          />
          <Input
            label="E-posta"
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          />
          <Input
            label="Şifre"
            type="password"
            value={newMember.password}
            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
          />
          <Input
            label="Telefon"
            type="tel"
            value={newMember.phone}
            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
          />
          <Select
            label="Cinsiyet"
            value={newMember.gender}
            onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as '' | Gender })}
            options={[
              { value: '', label: 'Seçiniz' },
              { value: 'male', label: 'Erkek' },
              { value: 'female', label: 'Kadın' },
            ]}
          />
          {addError && <p className="text-sm text-danger">{addError}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button type="submit" loading={adding}>
              Ekle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
