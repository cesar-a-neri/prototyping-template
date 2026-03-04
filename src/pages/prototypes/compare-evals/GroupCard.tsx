import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, Layers, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EvaluationGroup } from '@/utils/csvLoader';

// Group Card Component
interface GroupCardProps {
    group: EvaluationGroup;
    isSelected?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, isSelected = false, onClick, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white border rounded-lg px-6 py-6 flex flex-col gap-2 cursor-pointer hover:border-[#4f3fd4] transition-colors relative",
                isSelected ? "border-[#4f3fd4]" : "border-border"
            )}
        >
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
                            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onEdit?.();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2"
                                >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onDelete?.();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
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
    );
};

export type { GroupCardProps };
export { GroupCard };
