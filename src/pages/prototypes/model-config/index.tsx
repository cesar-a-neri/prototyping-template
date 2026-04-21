import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Minus, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const GPU_TYPES = [
  { value: 'nvidia-a100-80gb', label: 'NVIDIA A100 80GB' },
  { value: 'nvidia-a100-40gb', label: 'NVIDIA A100 40GB' },
  { value: 'nvidia-h100-80gb', label: 'NVIDIA H100 80GB' },
  { value: 'nvidia-v100-32gb', label: 'NVIDIA V100 32GB' },
  { value: 'nvidia-t4-16gb',   label: 'NVIDIA T4 16GB' },
  { value: 'amd-mi250',        label: 'AMD MI250' },
];

// ─── Field primitives ─────────────────────────────────────────────────────────

const FieldLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="block text-[12px] font-medium text-gray-10 mb-1.5">
    {children}
  </label>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-[11px] text-gray-8">{children}</p>
);

// ─── Text Input ───────────────────────────────────────────────────────────────

const TextInput = ({
  id, value, onChange, placeholder,
}: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <input
    id={id}
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full h-8 px-2.5 rounded-md border border-gray-6 bg-white text-[13px] text-gray-12 placeholder:text-gray-8 focus:outline-none focus:ring-2 focus:ring-[#714DFF] focus:ring-offset-1 transition-shadow"
  />
);

// ─── Number Stepper ───────────────────────────────────────────────────────────

const NumberStepper = ({
  id, value, onChange, min, max, suffix,
}: {
  id?: string; value: number; onChange: (v: number) => void; min: number; max: number; suffix?: string;
}) => (
  <div className="flex items-center h-8 w-full">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label="Decrease"
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-l-md border border-r-0 border-gray-6 bg-gray-2 text-gray-11 transition-colors shrink-0',
        value <= min ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-3 hover:text-gray-12',
      )}
    >
      <Minus size={12} strokeWidth={2.5} />
    </button>

    <div className="relative flex-1 h-8">
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        className={cn(
          'w-full h-full border border-gray-6 bg-white text-[13px] text-gray-12 text-center focus:outline-none focus:ring-2 focus:ring-[#714DFF] focus:ring-offset-1 transition-shadow',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          suffix ? 'pr-7' : '',
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-9 font-medium">
          {suffix}
        </span>
      )}
    </div>

    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label="Increase"
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-r-md border border-l-0 border-gray-6 bg-gray-2 text-gray-11 transition-colors shrink-0',
        value >= max ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-3 hover:text-gray-12',
      )}
    >
      <Plus size={12} strokeWidth={2.5} />
    </button>
  </div>
);

// ─── Endpoint option card ─────────────────────────────────────────────────────

const EndpointOption = ({
  value, label, description, currentValue,
}: {
  value: string; label: string; description: string; currentValue: string;
}) => {
  const selected = currentValue === value;
  return (
    <label
      htmlFor={`endpoint-${value}`}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
        selected
          ? 'border-[#714DFF] bg-[#714DFF08] ring-1 ring-[#714DFF]'
          : 'border-gray-5 bg-white hover:border-gray-7',
      )}
    >
      <RadioGroupItem value={value} id={`endpoint-${value}`} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-gray-12">{label}</span>
        <span className="text-[12px] text-gray-10 leading-relaxed">{description}</span>
      </div>
    </label>
  );
};

// ─── Section divider ──────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-9 pb-3 border-b border-gray-4">
    {children}
  </h3>
);

// ─── Form state ───────────────────────────────────────────────────────────────

interface ModelForm {
  name: string;
  gpuType: string;
  memory: number;
  storage: number;
  cpu: number;
  gpuCount: number;
  minWorkers: number;
  maxWorkers: number;
  perWorker: number;
  endpointType: 'async' | 'streaming';
}

const INITIAL: ModelForm = {
  name: 'document-extraction-v2',
  gpuType: 'nvidia-a100-80gb',
  memory: 16,
  storage: 50,
  cpu: 4,
  gpuCount: 1,
  minWorkers: 1,
  maxWorkers: 4,
  perWorker: 2,
  endpointType: 'async',
};

// ─── Modal form ───────────────────────────────────────────────────────────────

const ModelConfigForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState<ModelForm>(INITIAL);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ModelForm>(key: K, value: ModelForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-[min(680px,calc(100vw-32px))] max-h-[min(760px,calc(100vh-48px))]',
          'bg-white rounded-xl shadow-xl border border-gray-4',
          'flex flex-col',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-4 shrink-0">
          <div>
            <Dialog.Title className="text-[15px] font-semibold text-gray-12">
              Edit model
            </Dialog.Title>
            <Dialog.Description className="text-[12px] text-gray-9 mt-0.5">
              {form.name || 'Untitled model'}
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              className="flex items-center justify-center w-7 h-7 rounded-md text-gray-9 hover:bg-gray-3 hover:text-gray-12 transition-colors"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </Dialog.Close>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex flex-col gap-6">

            {/* General */}
            <div className="flex flex-col gap-4">
              <SectionTitle>General</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="model-name">Model name</FieldLabel>
                  <TextInput
                    id="model-name"
                    value={form.name}
                    onChange={v => set('name', v)}
                    placeholder="e.g. my-model-v1"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="gpu-type">GPU type</FieldLabel>
                  <Select value={form.gpuType} onValueChange={v => set('gpuType', v)}>
                    <SelectTrigger id="gpu-type" className="h-8 text-[13px] focus:ring-[#714DFF]">
                      <SelectValue placeholder="Select a GPU…" />
                    </SelectTrigger>
                    <SelectContent>
                      {GPU_TYPES.map(g => (
                        <SelectItem key={g.value} value={g.value} className="text-[13px]">
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4">
              <SectionTitle>Resources</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="memory">Memory</FieldLabel>
                  <NumberStepper id="memory" value={form.memory} onChange={v => set('memory', v)} min={0} max={100} suffix="Gi" />
                  <FieldHint>0 – 100 Gi</FieldHint>
                </div>
                <div>
                  <FieldLabel htmlFor="storage">Storage</FieldLabel>
                  <NumberStepper id="storage" value={form.storage} onChange={v => set('storage', v)} min={0} max={100} suffix="Gb" />
                  <FieldHint>0 – 100 Gb</FieldHint>
                </div>
                <div>
                  <FieldLabel htmlFor="cpu">CPU</FieldLabel>
                  <NumberStepper id="cpu" value={form.cpu} onChange={v => set('cpu', v)} min={0} max={10} />
                  <FieldHint>0 – 10 cores</FieldHint>
                </div>
                <div>
                  <FieldLabel htmlFor="gpu-count">GPU count</FieldLabel>
                  <NumberStepper id="gpu-count" value={form.gpuCount} onChange={v => set('gpuCount', v)} min={0} max={10} />
                  <FieldHint>0 – 10 GPUs</FieldHint>
                </div>
              </div>
            </div>

            {/* Scaling */}
            <div className="flex flex-col gap-4">
              <SectionTitle>Scaling</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel htmlFor="min-workers">Min workers</FieldLabel>
                  <NumberStepper
                    id="min-workers"
                    value={form.minWorkers}
                    onChange={v => set('minWorkers', Math.min(v, form.maxWorkers))}
                    min={0} max={10}
                  />
                  <FieldHint>0 – 10</FieldHint>
                </div>
                <div>
                  <FieldLabel htmlFor="max-workers">Max workers</FieldLabel>
                  <NumberStepper
                    id="max-workers"
                    value={form.maxWorkers}
                    onChange={v => set('maxWorkers', Math.max(v, form.minWorkers))}
                    min={0} max={10}
                  />
                  <FieldHint>0 – 10</FieldHint>
                </div>
                <div>
                  <FieldLabel htmlFor="per-worker">Per worker</FieldLabel>
                  <NumberStepper id="per-worker" value={form.perWorker} onChange={v => set('perWorker', v)} min={0} max={10} />
                  <FieldHint>0 – 10</FieldHint>
                </div>
              </div>
            </div>

            {/* Endpoint type */}
            <div className="flex flex-col gap-4">
              <SectionTitle>Endpoint type</SectionTitle>
              <RadioGroup
                value={form.endpointType}
                onValueChange={v => set('endpointType', v as 'async' | 'streaming')}
                className="flex flex-col gap-2"
              >
                <EndpointOption
                  value="async"
                  label="Async"
                  description="Requests are queued and processed asynchronously. Best for long-running tasks where the client polls for results."
                  currentValue={form.endpointType}
                />
                <EndpointOption
                  value="streaming"
                  label="Streaming"
                  description="Results are streamed back token-by-token as they are generated. Best for real-time, interactive use cases."
                  currentValue={form.endpointType}
                />
              </RadioGroup>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-4 shrink-0">
          <Dialog.Close asChild>
            <button
              type="button"
              className="h-8 px-4 rounded-md text-[13px] font-medium text-gray-11 border border-gray-5 bg-white hover:bg-gray-2 transition-colors"
            >
              Cancel
            </button>
          </Dialog.Close>
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              'h-8 px-4 rounded-md text-[13px] font-medium text-white transition-all',
              saved ? 'bg-green-9' : 'bg-[#714DFF] hover:bg-[#5f3ee8]',
            )}
          >
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

// ─── Prototype ────────────────────────────────────────────────────────────────

const ModelConfig: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-2 flex items-center justify-center">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="h-9 px-4 rounded-md text-[13px] font-medium text-white bg-[#714DFF] hover:bg-[#5f3ee8] transition-colors shadow-sm"
          >
            Edit model
          </button>
        </Dialog.Trigger>

        <ModelConfigForm onClose={() => setOpen(false)} />
      </Dialog.Root>
    </div>
  );
};

export const title = 'Model Config';
export const route = '/model-config';

export default ModelConfig;
