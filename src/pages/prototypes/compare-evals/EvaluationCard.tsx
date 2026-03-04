import React from 'react';
import { Tag, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// Evaluation Card Component
interface EvaluationCardProps {
    name: string;
    date: string;
    dateLabel: string;
    tags: string[];
    isHighlighted?: boolean;
    onClick?: () => void;
    withCheckbox?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
    name,
    date,
    dateLabel,
    tags,
    isHighlighted = false,
    onClick,
    withCheckbox = false,
    isChecked = false,
    onCheckChange
}) => {
    const handleClick = () => {
        if (withCheckbox && onCheckChange) {
            onCheckChange(!isChecked);
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "bg-white border rounded-lg py-6 flex flex-col gap-2 cursor-pointer hover:border-[#4f3fd4] transition-colors",
                withCheckbox ? "px-6" : "px-6",
                isHighlighted ? "border-[#4f3fd4]" : "border-border"
            )}
        >
            <div className="flex gap-4">
                {withCheckbox && (
                    <div className="flex items-start pt-0.5">
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onCheckChange?.(!isChecked);
                            }}
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
                <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground leading-[16px]">
                        {name}
                    </h3>
                            {!withCheckbox && (
                    <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                            )}
                </div>
                <p className="text-xs text-muted-foreground leading-[16px]">
                    {dateLabel} {date}
                </p>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {tags.map((tag, index) => (
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

export type { EvaluationCardProps };
export { EvaluationCard };
