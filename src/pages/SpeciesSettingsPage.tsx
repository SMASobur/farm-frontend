import { useState, type FormEvent } from 'react';
import { Milk, Egg } from 'lucide-react';
import { EntityManager, type ColumnDef } from '@/components/settings/EntityManager';
import { listSpeciesAll, createSpecies, updateSpecies, toggleSpeciesActive } from '@/api/settings';
import type { Species } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

const localGenerateCode = (name: string) =>
    name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

// Common farm emojis for quick selection
const EMOJI_OPTIONS = ['🐄', '🐐', '🐑', '🐃', '🐓', '🦆', '🦢', '🦃', '🐇', '🐫', '🐎', '🐦', '🐝', '🐟', '🐾'];

interface SpeciesPayload {
    name: string;
    nameBn?: string;
    code: string;
    emoji?: string;
    milkProducer: boolean;
    eggProducer: boolean;
    active: boolean;
}

export function SpeciesSettingsPage() {
    const columns: ColumnDef<Species>[] = [
        {
            key: 'name',
            header: 'Species',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji || '🐾'}</span>
                    <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.nameBn && <div className="text-xs text-gray-500">{item.nameBn}</div>}
                    </div>
                </div>
            ),
        },
        {
            key: 'producers',
            header: 'Produces',
            render: (item) => (
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    {item.milkProducer && (
                        <span className="flex items-center gap-1 text-blue-600">
                            <Milk size={14} /> Milk
                        </span>
                    )}
                    {item.eggProducer && (
                        <span className="flex items-center gap-1 text-amber-600">
                            <Egg size={14} /> Eggs
                        </span>
                    )}
                    {!item.milkProducer && !item.eggProducer && (
                        <span className="text-gray-400 italic">None</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <EntityManager<Species>
            title="Species"
            description="Manage the types of animals on your farm."
            queryKey="species-settings"
            queryFn={() => listSpeciesAll(true)}
            createFn={createSpecies}
            updateFn={updateSpecies}
            toggleActiveFn={toggleSpeciesActive}
            columns={columns}
            renderForm={(initial, onSubmit, onCancel) => (
                <SpeciesForm
                    initial={initial}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            )}
            searchPlaceholder="Search species..."
        />
    );
}

function SpeciesForm({
                         initial,
                         onSubmit,
                         onCancel
                     }: {
    initial: Species | null;
    onSubmit: (data: SpeciesPayload) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [nameBn, setNameBn] = useState(initial?.nameBn ?? '');
    const [emoji, setEmoji] = useState(initial?.emoji ?? '');
    const [milk, setMilk] = useState(initial?.milkProducer ?? false);
    const [egg, setEgg] = useState(initial?.eggProducer ?? false);
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Species name is required.');
            return;
        }

        const payload: SpeciesPayload = {
            name: name.trim(),
            nameBn: nameBn.trim() || undefined,
            code: initial?.code || localGenerateCode(name),
            emoji: emoji.trim() || undefined,
            milkProducer: milk,
            eggProducer: egg,
            active: initial?.active ?? true,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <Field label="Species Name" htmlFor="speciesName" required>
                <Input
                    id="speciesName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cow, Goat, Chicken"
                    autoFocus
                />
            </Field>

            <Field label="Name (Bengali)" htmlFor="speciesNameBn" help="Optional">
                <Input
                    id="speciesNameBn"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. গরু"
                />
            </Field>

            {/* Emoji Picker + Custom Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg items-center">
                    {/* Quick Select Picker */}
                    {EMOJI_OPTIONS.map((e) => (
                        <button
                            key={e}
                            type="button"
                            onClick={() => setEmoji(e)}
                            className={`text-2xl p-1.5 rounded-md transition hover:bg-white hover:shadow-sm ${
                                emoji === e ? 'bg-white shadow-sm ring-2 ring-green-500' : ''
                            }`}
                        >
                            {e}
                        </button>
                    ))}

                    {/* Custom Paste Input */}
                    <div className="flex items-center ml-auto pl-2 border-l border-gray-300">
                        <input
                            type="text"
                            value={emoji}
                            onChange={(e) => setEmoji(e.target.value)}
                            placeholder="Paste custom"
                            className="w-24 text-center text-xl bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 p-1"
                            maxLength={5}
                            title="Copy and paste a custom emoji here"
                        />
                    </div>
                </div>
            </div>

            <Field label="System Code" htmlFor="speciesCode" help="Auto-generated, cannot be changed on edit">
                <Input
                    id="speciesCode"
                    value={initial?.code || localGenerateCode(name)}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
            </Field>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Produces</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={milk}
                            onChange={(e) => setMilk(e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                        />
                        Milk
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={egg}
                            onChange={(e) => setEgg(e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                        />
                        Eggs
                    </label>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Save Species
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}