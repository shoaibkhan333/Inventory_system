import { useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Moon,
  Bell,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const currencies = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

export default function Settings() {
  const { state, updateSettings, resetData, exportData, importData } = useInventory();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetModal, setResetModal] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Data exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const success = await importData(ev.target?.result as string);
      if (success) {
        toast('success', 'Data imported successfully');
      } else {
        toast('error', 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    await resetData();
    setResetModal(false);
    toast('success', 'Data reset to defaults');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <Card>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Company Settings</h3>
            <p className="text-sm text-gray-500">Configure your organization details</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            value={state.settings.companyName}
            onChange={(e) => updateSettings({ companyName: e.target.value })}
          />
          <Select
            label="Currency"
            value={state.settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            options={currencies}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
            <p className="text-sm text-gray-500">Customize your experience</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch between light and dark themes</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !state.settings.darkMode })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                state.settings.darkMode ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  state.settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">Show notifications for low stock items</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ lowStockAlerts: !state.settings.lowStockAlerts })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                state.settings.lowStockAlerts ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  state.settings.lowStockAlerts ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
            <p className="text-sm text-gray-500">Export, import, or reset your inventory data</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={handleExport} className="w-full">
            <Download className="h-4 w-4" /> Export Data
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <Button variant="outline" onClick={() => setResetModal(true)} className="w-full text-red-600 hover:text-red-700">
            <RotateCcw className="h-4 w-4" /> Reset Data
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500">Data Summary</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{state.products.length}</span>
              <span className="text-gray-500"> products</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{state.categories.length}</span>
              <span className="text-gray-500"> categories</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{state.suppliers.length}</span>
              <span className="text-gray-500"> suppliers</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{state.movements.length}</span>
              <span className="text-gray-500"> movements</span>
            </div>
          </div>
        </div>
      </Card>

      <Modal open={resetModal} onClose={() => setResetModal(false)} title="Reset All Data" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will reset all inventory data to the default sample data. Your current data will be
          permanently lost. Are you sure?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setResetModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleReset}>Reset Everything</Button>
        </div>
      </Modal>
    </div>
  );
}
