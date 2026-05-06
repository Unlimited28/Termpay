import { useState } from 'react'
import {
  GraduationCap,
  PlusCircle,
  Pencil,
  Trash2,
  Calculator,
  Zap,
  CheckCircle2,
  Sparkles,
  Tag,
  Loader2
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import { Card, Button, Badge, Modal, Input, Select } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { mockClasses, mockExtraFeeItems } from '../../mock/mockData'

interface FeeItem {
  id: string
  name: string
  amount: number
  appliesTo: string[] // class names or 'All Classes'
  compulsory: boolean
  addedBy: string
  description?: string
  isBase?: boolean
}

const FeeStructurePage = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { generateBills } = useData()
  const isProprietor = user?.role === 'proprietor'

  // Initial base fees
  const baseFees: Record<string, { tuition: number; feeding: number; pta: number; dev: number }> = {
    'Nursery 1': { tuition: 40000, feeding: 22000, pta: 5000, dev: 8000 },
    'Nursery 2': { tuition: 40000, feeding: 22000, pta: 5000, dev: 8000 },
    'Primary 1': { tuition: 45000, feeding: 25000, pta: 5000, dev: 10000 },
    'Primary 2': { tuition: 45000, feeding: 25000, pta: 5000, dev: 10000 },
    'Primary 3': { tuition: 50000, feeding: 28000, pta: 5000, dev: 12000 },
  }

  const [extraFees, setExtraFees] = useState<FeeItem[]>(
    mockExtraFeeItems.map(f => ({ ...f, isBase: false })) as FeeItem[]
  )
  const [editingClass, setEditingClass] = useState<string | null>(null)
  const [classBaseFees] = useState(baseFees)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState<number | null>(null)

  const [newFee, setNewFee] = useState({
    name: '',
    amount: '',
    appliesTo: 'All Classes',
    compulsory: true,
    description: ''
  })

  const handleAddFeeItem = () => {
    if (!newFee.name || !newFee.amount) {
      toast.error("Please fill in required fields")
      return
    }

    const item: FeeItem = {
      id: `ef${Date.now()}`,
      name: newFee.name,
      amount: Number(newFee.amount),
      appliesTo: newFee.appliesTo === 'All Classes' ? ['All Classes'] : [newFee.appliesTo],
      compulsory: newFee.compulsory,
      addedBy: user?.fullName || 'Mrs. Folake Adeyemi',
      description: newFee.description,
      isBase: false
    }

    setExtraFees([...extraFees, item])
    setIsAddModalOpen(false)
    setNewFee({ name: '', amount: '', appliesTo: 'All Classes', compulsory: true, description: '' })
    toast.success(`${item.name} added to ${newFee.appliesTo}`)
  }

  const handleDeleteFee = (id: string) => {
    const feeToDelete = extraFees.find(f => f.id === id)
    if (!feeToDelete) return

    if (confirm(`Remove ${feeToDelete.name}? This will remove it from all student bills that have not been confirmed yet.`)) {
      setExtraFees(extraFees.filter(f => f.id !== id))
      toast.success(`${feeToDelete.name} removed`)
    }
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setGenerationStep(0)

    // Calculate final fees for each class
    const classFinalFees: Record<string, number> = {}
    mockClasses.forEach(cls => {
      const { total } = getClassFees(cls.name)
      classFinalFees[cls.name] = total
    })

    for (let i = 0; i < mockClasses.length; i++) {
      setGenerationStep(i)
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    generateBills(classFinalFees)
    setGenerationStep(mockClasses.length)
    toast.success(`Bills generated successfully for 15 students.`)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationStep(null)
    }, 1000)
  }

  const getClassFees = (className: string) => {
    const base = classBaseFees[className] || { tuition: 0, feeding: 0, pta: 0, dev: 0 }
    const extra = extraFees.filter(f => f.appliesTo.includes('All Classes') || f.appliesTo.includes(className))

    const items = [
      { name: 'Tuition Fee', amount: base.tuition, compulsory: true },
      { name: 'Feeding', amount: base.feeding, compulsory: true },
      { name: 'PTA Levy', amount: base.pta, compulsory: true },
      { name: 'Development Levy', amount: base.dev, compulsory: true },
      ...extra.map(f => ({ name: f.name, amount: f.amount, compulsory: f.compulsory, isNew: f.id.startsWith('ef') }))
    ]

    const total = items.reduce((acc, curr) => acc + (curr.compulsory ? curr.amount : 0), 0)

    return { items, total }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Fee Structure</h1>
          <p className="text-[14px] text-[#64748B]">Second Term 2025/2026</p>
        </div>
        <Button
          onClick={handleGenerateAll}
          className="h-[44px] px-6 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg, #0D2137 0%, #1B3A5C 100%)' }}
        >
          <Zap size={18} className="mr-2" />
          Generate All Bills
        </Button>
      </div>

      {/* Active Term Card */}
      <Card className="mb-8 border-t-[3px] border-t-[#2E7D32]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#2E7D32]">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold text-[#0F172A]">Second Term 2025/2026</h2>
                <Badge variant="success" className="text-[10px] uppercase">Active</Badge>
              </div>
              <p className="text-[13px] text-[#64748B]">Jan 12, 2026 - Apr 15, 2026</p>
            </div>
          </div>
          <button className="text-[13px] font-semibold text-[#1565C0] hover:underline">Change Term</button>
        </div>
      </Card>

      {/* Global Fee Items */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Term Fee Items</h2>
          <Button
            variant="secondary"
            size="sm"
            className="h-[36px] border-[#E2E8F0]"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={16} className="mr-2" />
            Add Fee Item
          </Button>
        </div>
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-3">Fee Name</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Applies To</th>
                  <th className="px-6 py-3 text-center">Compulsory</th>
                  <th className="px-6 py-3">Added By</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="group">
                  <td className="px-6 py-4 font-medium text-[#0F172A]">Tuition Fee</td>
                  <td className="px-6 py-4 text-[#64748B]">Varies by class</td>
                  <td className="px-6 py-4 text-[#64748B]">All Classes</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="success" className="text-[10px]">YES</Badge>
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">System</td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
                <tr className="group">
                  <td className="px-6 py-4 font-medium text-[#0F172A]">Feeding</td>
                  <td className="px-6 py-4 text-[#64748B]">Varies by class</td>
                  <td className="px-6 py-4 text-[#64748B]">All Classes</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="success" className="text-[10px]">YES</Badge>
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">System</td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
                {extraFees.map(fee => (
                  <tr key={fee.id} className="group">
                    <td className="px-6 py-4 font-medium text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        {fee.name}
                        {!fee.compulsory && <Tag size={12} className="text-[#94A3B8]" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">₦{fee.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#64748B]">{fee.appliesTo.join(', ')}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={fee.compulsory ? 'success' : 'neutral'} className="text-[10px]">
                        {fee.compulsory ? 'YES' : 'NO'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">{fee.addedBy}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isProprietor && (
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A]">
                            <Pencil size={16} />
                          </button>
                        )}
                        {/* Delete button hidden for all roles as specified */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Class Fee Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        {mockClasses.map((cls) => {
          const { items, total } = getClassFees(cls.name)
          const isEditing = editingClass === cls.id

          return (
            <Card key={cls.id} className="p-0 flex flex-col h-full">
              <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">{cls.name}</h3>
                  <p className="text-[12px] text-[#94A3B8] uppercase font-semibold tracking-wider">{cls.studentCount} Students</p>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-800 text-[#0F172A]">₦{total.toLocaleString()}</div>
                  {!isProprietor && (
                    <button
                      className="text-[13px] font-semibold text-[#1565C0] hover:underline"
                      onClick={() => setEditingClass(isEditing ? null : cls.id)}
                    >
                      {isEditing ? 'Cancel' : 'Edit Fees'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[320px]">
                    <thead>
                      <tr className="border-b border-[#F1F5F9]">
                        <th className="px-6 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Fee Item</th>
                        <th className="px-6 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Amount (₦)</th>
                        <th className="px-6 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider text-center">Compulsory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#F1F5F9] last:border-0 h-[48px]">
                          <td className="px-6 py-2 text-[14px] font-medium text-[#334155]">
                            <div className="flex items-center gap-2">
                              {item.name}
                              {(item as any).isNew && <Sparkles size={12} className="text-amber-500" />}
                            </div>
                          </td>
                          <td className="px-6 py-2 text-[14px] text-right text-[#64748B]">
                            {isEditing ? (
                              <input
                                type="number"
                                className="w-24 text-right border border-[#E2E8F0] rounded px-2 py-1 focus:border-[#1565C0] outline-none"
                                defaultValue={item.amount}
                              />
                            ) : (
                              `₦${item.amount.toLocaleString()}`
                            )}
                          </td>
                          <td className="px-6 py-2 text-center">
                            <Badge variant={item.compulsory ? 'success' : 'neutral'} className="text-[10px]">
                              {item.compulsory ? 'YES' : 'NO'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50/50 mt-auto flex justify-between items-center">
                {isEditing ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast.success(`Fee structure updated for ${cls.name}`)
                        setEditingClass(null)
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditingClass(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px] text-[#64748B]">Total per student for term</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-[32px] text-[12px] font-bold border-[#E2E8F0]"
                      onClick={() => toast.success(`Bills generated for ${cls.name}`)}
                    >
                      Generate
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} className="text-[#0F172A]" />
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Fee Summary — Second Term 2025/2026</h2>
        </div>
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Students</th>
                  <th className="px-6 py-3">Base Fee</th>
                  <th className="px-6 py-3">Extra Fees</th>
                  <th className="px-6 py-3">Total Per Student</th>
                  <th className="px-6 py-3 text-right">Estimated Total Collection</th>
                </tr>
              </thead>
              <tbody>
                {mockClasses.map(cls => {
                  const base = classBaseFees[cls.name]
                  const baseTotal = base.tuition + base.feeding + base.pta + base.dev
                  const extra = extraFees
                    .filter(f => f.appliesTo.includes('All Classes') || f.appliesTo.includes(cls.name))
                    .reduce((acc, curr) => acc + (curr.compulsory ? curr.amount : 0), 0)
                  const total = baseTotal + extra

                  return (
                    <tr key={cls.id}>
                      <td className="px-6 py-4 font-medium text-[#0F172A]">{cls.name}</td>
                      <td className="px-6 py-4 text-[#64748B]">{cls.studentCount}</td>
                      <td className="px-6 py-4 text-[#64748B]">₦{baseTotal.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[#64748B]">₦{extra.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-[#0F172A]">₦{total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#2E7D32]">₦{(total * cls.studentCount).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Fee Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Fee Item"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFeeItem}>Add Fee Item</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Fee Name"
            placeholder="e.g. Excursion Fee, Computer Levy, Sports Fee"
            value={newFee.name}
            onChange={(e) => setNewFee({...newFee, name: e.target.value})}
            required
          />
          <Input
            label="Amount (₦)"
            type="number"
            placeholder="0"
            value={newFee.amount}
            onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
            required
          />
          <Select
            label="Apply To"
            options={[
              { value: 'All Classes', label: 'All Classes' },
              { value: 'Nursery 1', label: 'Nursery 1' },
              { value: 'Nursery 2', label: 'Nursery 2' },
              { value: 'Primary 1', label: 'Primary 1' },
              { value: 'Primary 2', label: 'Primary 2' },
              { value: 'Primary 3', label: 'Primary 3' },
            ]}
            value={newFee.appliesTo}
            onChange={(e) => setNewFee({...newFee, appliesTo: e.target.value})}
          />
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="compulsory"
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#1565C0] focus:ring-[#1565C0]"
              checked={newFee.compulsory}
              onChange={(e) => setNewFee({...newFee, compulsory: e.target.checked})}
            />
            <label htmlFor="compulsory" className="text-sm font-medium text-[#334155]">Compulsory Fee</label>
          </div>
          {!newFee.compulsory && (
            <p className="text-[12px] text-amber-600 bg-amber-50 p-2 rounded">
              Optional fees will be shown on the bill but not included in the total balance calculation
            </p>
          )}
          <Input
            label="Description (Optional)"
            placeholder="Brief note about this fee"
            value={newFee.description}
            onChange={(e) => setNewFee({...newFee, description: e.target.value})}
          />
        </div>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isOpen={isGenerating}
        onClose={() => {}}
        title="Generating Student Bills"
      >
        <div className="p-6 flex flex-col items-center">
          {generationStep !== mockClasses.length ? (
            <>
              <Loader2 size={40} className="text-[#1565C0] animate-spin mb-6" />
              <p className="text-[16px] font-medium text-[#0F172A] mb-8 text-center">
                Generating bills for 15 students...
              </p>
              <div className="w-full space-y-4">
                {mockClasses.map((cls, i) => (
                  <div key={cls.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#334155]">{cls.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B]">{cls.studentCount} students</span>
                      {generationStep !== null && generationStep >= i ? (
                        <CheckCircle2 size={16} className="text-[#2E7D32] animate-in zoom-in" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-100" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-[#2E7D32] mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">Bills Generated Successfully</h3>
              <p className="text-[#64748B] mb-8">All 15 students have been billed for the Second Term.</p>
              <Button onClick={() => setIsGenerating(false)} className="w-full">Close</Button>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default FeeStructurePage
