import { UserCheck } from 'lucide-react';

interface Props {
    enteredByName: string | null | undefined;
    createdAt: string | null | undefined;
}

export function EnteredByLine({ enteredByName, createdAt }: Props) {
    if (!enteredByName && !createdAt) return null;

    return (
        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
            <UserCheck size={12} />
            {enteredByName ? (
                <>
                    <span>Entered by <span className="font-medium text-gray-500">{enteredByName}</span></span>
                </>
            ) : (
                <span>Entry recorded</span>
            )}
            {createdAt && (
                <>
                    <span>·</span>
                    <span>{createdAt}</span>
                </>
            )}
        </div>
    );
}