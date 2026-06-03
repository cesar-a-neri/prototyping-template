import React, { useState } from 'react';
import { MoreHorizontal, Layers, Tag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EvaluationGroup } from '@/utils/csvLoader';

interface GroupCardProps {
    group: EvaluationGroup;
    isSelected?: boolean;
    onClick?: () => void;
    onArchive?: () => void;
    onDuplicateAndRerun?: () => void;
    withCheckbox?: boolean;
    isChecked?: boolean;
    onSelectMultiple?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
    group,
    isSelected = false,
    onClick,
    onArchive,
    onDuplicateAndRerun,
    withCheckbox = false,
    isChecked = false,
    onSelectMultiple,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white border rounded-lg px-6 py-6 flex flex-col gap-2 cursor-pointer hover:border-[#4f3fd4] transition-colors relative",
                isSelected ? "border-[#4f3fd4]" : "border-border"
            )}
        >
            <div className="flex gap-4">
                {withCheckbox && (
                    <div className="flex items-start pt-0.5">
                        <div
                            className={cn(
                                "w-3.5 h-3.5 rounded flex items-center justify-center cursor-pointer transition-colors",
                                isChecked
                                    ? "bg-[#714dff] border border-[#714dff]"
                                    : "bg-white border border-border"
                            )}
                        >
                            {isChecked && (
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                )}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
                                <h3 className="text-xs font-medium text-foreground leading-[16px] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {group.name}
                                </h3>
                                <span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0] leading-4 shrink-0">
                                    {group.evaluations.length}
                                </span>
                            </div>
                            {!withCheckbox && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(!showMenu);
                                        }}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMenu(false);
                                                    onSelectMultiple?.();
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-hover"
                                            >
                                                Select Multiple
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMenu(false);
                                                    onDuplicateAndRerun?.();
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-hover"
                                            >
                                                Duplicate and Rerun
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMenu(false);
                                                    onArchive?.();
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-hover text-red-600"
                                            >
                                                Archive
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-[16px]">
                            Created {group.createdDate}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1 items-center">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        {group.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-[6px] py-[2px] rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0] leading-4"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export type { GroupCardProps };
export { GroupCard };
