import { useState } from 'react'
import {
  GraduationCap,
  PlusCircle,
  Pencil,
  Calculator,
  Zap,
  CheckCircle2,
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
      <div className="animate-in fade-in slide-up duration-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-ink-primary tracking-tighter">Fee Structure</h1>
            <p className="text-[14px] text-ink-secondary">Second Term 2025/2026</p>
          </div>
          <Button onClick={handleGenerateAll}>
            <Zap size={18} className="mr-2" />
            Generate All Bills
          </Button>
        </div>

        {/* Active Term Card */}
        <Card className="mb-10 !bg-emerald/4 border-emerald/12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-emerald/15 flex items-center justify-center text-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[18px] font-bold text-ink-primary">Second Term 2025/2026</h2>
                  <Badge variant="success" className="uppercase font-black text-[9px] tracking-widest">Active</Badge>
                </div>
                <p className="text-[13px] text-ink-muted font-medium">Jan 12, 2026 - Apr 15, 2026</p>
              </div>
            </div>
            <button className="text-[13px] font-bold text-emerald hover:underline transition-all">Change Term</button>
          </div>
        </Card>

        {/* Global Fee Items */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-ink-primary tracking-tight">Term Fee Items</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Fee Item
            </Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-transparent">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Fee Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Applies To</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-center">Compulsory</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Added By</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr className="group hover:bg-white/[0.02]">
                    <td className="px-6 py-5 font-bold text-ink-primary">Tuition Fee</td>
                    <td className="px-6 py-5 text-ink-secondary">Varies by class</td>
                    <td className="px-6 py-5 text-ink-secondary">All Classes</td>
                    <td className="px-6 py-5 text-center">
                      <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest">YES</Badge>
                    </td>
                    <td className="px-6 py-5 text-[#475569]">System</td>
                    <td className="px-6 py-5 text-right"></td>
                  </tr>
                  <tr className="group hover:bg-white/[0.02]">
                    <td className="px-6 py-5 font-bold text-ink-primary">Feeding</td>
                    <td className="px-6 py-5 text-ink-secondary">Varies by class</td>
                    <td className="px-6 py-5 text-ink-secondary">All Classes</td>
                    <td className="px-6 py-5 text-center">
                      <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest">YES</Badge>
                    </td>
                    <td className="px-6 py-5 text-[#475569]">System</td>
                    <td className="px-6 py-5 text-right"></td>
                  </tr>
                  {extraFees.map(fee => (
                    <tr key={fee.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5 font-bold text-ink-primary">
                        <div className="flex items-center gap-2">
                          {fee.name}
                          {!fee.compulsory && <Tag size={12} className="text-[#475569]" />}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-emerald font-bold">₦{fee.amount.toLocaleString()}</td>
                      <td className="px-6 py-5 text-ink-secondary">{fee.appliesTo.join(', ')}</td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant={fee.compulsory ? 'success' : 'neutral'} className="text-[9px] font-black uppercase tracking-widest">
                          {fee.compulsory ? 'YES' : 'NO'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-[#475569]">{fee.addedBy}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isProprietor && (
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-ink-muted hover:text-ink-primary transition-colors">
                              <Pencil size={16} />
                            </button>
                          )}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {mockClasses.map((cls) => {
            const { items, total } = getClassFees(cls.name)
            const isEditing = editingClass === cls.id

            return (
              <Card key={cls.id} className="p-0 flex flex-col h-full overflow-hidden border border-white/6 hover:border-white/12 group transition-all">
                <div className="px-6 py-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="text-[20px] font-black text-ink-primary tracking-tighter">{cls.name}</h3>
                    <p className="text-[11px] text-[#475569] uppercase font-bold tracking-widest mt-1">{cls.studentCount} Students enrolled</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[28px] font-black text-emerald tracking-tight">₦{total.toLocaleString()}</div>
                    {!isProprietor && (
                      <button
                        className="text-[12px] font-bold text-ink-muted hover:text-ink-primary transition-all mt-1"
                        onClick={() => setEditingClass(isEditing ? null : cls.id)}
                      >
                        {isEditing ? 'Cancel Editing' : 'Adjust Structure'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-transparent">
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Fee Item</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-right">Amount (₦)</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {items.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-white/[0.01]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-ink-secondary">{item.name}</span>
                                {(item as any).isNew && <Badge variant="paid" className="text-[8px] font-black uppercase tracking-widest scale-90">NEW</Badge>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="w-24 text-right bg-white/4 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-ink-primary focus:border-emerald/50 outline-none"
                                  defaultValue={item.amount}
                                />
                              ) : (
                                <span className="text-sm font-bold text-ink-primary">₦{item.amount.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={item.compulsory ? 'success' : 'neutral'} className="text-[9px] font-black uppercase tracking-widest">
                                {item.compulsory ? 'Compulsory' : 'Optional'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white/[0.02] border-t border-white/[0.04] mt-auto flex justify-between items-center">
                  {isEditing ? (
                    <div className="flex gap-3 w-full">
                      <Button
                        size="sm"
                        className="flex-1 h-10"
                        onClick={() => {
                          toast.success(`Fee structure updated for ${cls.name}`)
                          setEditingClass(null)
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button variant="secondary" size="sm" className="h-10" onClick={() => setEditingClass(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[12px] text-[#475569] font-medium italic">Final term balance per student</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold"
                        onClick={() => toast.success(`Bills generated for ${cls.name}`)}
                      >
                        Re-sync
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
          <div className="flex items-center gap-3 mb-6 p-6 bg-emerald/4 border border-emerald/12 rounded-[16px]">
            <Calculator size={22} className="text-emerald" />
            <div>
              <h2 className="text-[18px] font-bold text-ink-primary">Fee Summary — Second Term 2025/2026</h2>
              <p className="text-xs text-[#475569] font-medium mt-0.5 uppercase tracking-widest">Estimated global projections based on current structure</p>
            </div>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-transparent">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Class</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Students</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Base Fee</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Extra Fees</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Per Student</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Estimated Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {mockClasses.map(cls => {
                    const base = classBaseFees[cls.name]
                    const baseTotal = base.tuition + base.feeding + base.pta + base.dev
                    const extra = extraFees
                      .filter(f => f.appliesTo.includes('All Classes') || f.appliesTo.includes(cls.name))
                      .reduce((acc, curr) => acc + (curr.compulsory ? curr.amount : 0), 0)
                    const total = baseTotal + extra

                    return (
                      <tr key={cls.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-5 font-bold text-ink-primary">{cls.name}</td>
                        <td className="px-6 py-5 text-ink-secondary font-medium">{cls.studentCount}</td>
                        <td className="px-6 py-5 text-[#475569] font-medium">₦{baseTotal.toLocaleString()}</td>
                        <td className="px-6 py-5 text-[#475569] font-medium">₦{extra.toLocaleString()}</td>
                        <td className="px-6 py-5 font-black text-ink-primary">₦{total.toLocaleString()}</td>
                        <td className="px-6 py-5 text-right font-black text-emerald tracking-tight text-base">₦{(total * cls.studentCount).toLocaleString()}</td>
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
          <div className="space-y-6">
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
            <div className="flex items-center gap-3.5 p-3.5 bg-white/4 rounded-xl border border-white/8">
              <input
                type="checkbox"
                id="compulsory"
                className="w-4 h-4 rounded border-white/20 bg-white/4 text-emerald focus:ring-emerald cursor-pointer"
                checked={newFee.compulsory}
                onChange={(e) => setNewFee({...newFee, compulsory: e.target.checked})}
              />
              <label htmlFor="compulsory" className="text-sm font-bold text-ink-secondary cursor-pointer">Compulsory Fee Item</label>
            </div>
            {!newFee.compulsory && (
              <p className="text-[12px] text-warning-light bg-warning/8 p-3 rounded-xl border border-warning/12 leading-relaxed">
                Optional fees will be shown on the bill but not included in the total balance calculation until selected by the parent or bursar.
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
          <div className="py-8 flex flex-col items-center">
            {generationStep !== mockClasses.length ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <Loader2 size={32} className="text-emerald animate-spin" />
                </div>
                <p className="text-[18px] font-black text-ink-primary mb-8 text-center tracking-tight">
                  Generating bills for 15 students...
                </p>
                <div className="w-full space-y-4 px-2">
                  {mockClasses.map((cls, i) => (
                    <div key={cls.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-secondary font-semibold">{cls.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#475569] font-medium">{cls.studentCount} students</span>
                        {generationStep !== null && generationStep >= i ? (
                          <div className="text-emerald animate-in zoom-in duration-300">
                            <CheckCircle2 size={18} />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-white/6" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-emerald/15 flex items-center justify-center text-emerald mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-[22px] font-black text-ink-primary mb-3 tracking-tight">Bills Generated Successfully</h3>
                <p className="text-ink-secondary mb-10 font-medium">All 15 students have been billed for the Second Term 2025/2026.</p>
                <Button onClick={() => setIsGenerating(false)} className="w-full h-11">Done</Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default FeeStructurePage
