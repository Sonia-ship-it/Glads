import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

interface CounterProps {
    target: number;
    initialValue?: number;
    onUpdate?: (val: number) => void;
    suffix?: string;
    prefix?: string;
    duration?: number;
    zeroPad?: boolean;
}

export const Counter: React.FC<CounterProps> = ({
    target,
    initialValue = 0,
    onUpdate,
    suffix = '',
    prefix = '',
    duration = 2000,
    zeroPad = false
}) => {
    const [count, setCount] = useState(initialValue);
    const countRef = useRef<HTMLSpanElement>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted || count === target) return;

        const timer = setTimeout(() => {
            const diff = target - count;
            const step = Math.max(1, Math.abs(Math.ceil(diff / 10)));
            let next;
            if (diff > 0) {
                next = Math.min(target, count + step);
            } else {
                next = Math.max(target, count - step);
            }
            setCount(next);
            if (onUpdateRef.current) onUpdateRef.current(next);
        }, 30);

        return () => clearTimeout(timer);
    }, [hasStarted, target, count]);

    const formatCount = (num: number) => {
        if (zeroPad && num < 10) return `0${num}`;
        return num.toString();
    };

    return (
        <span ref={countRef} className="tabular-nums">
            {prefix}{formatCount(count)}{suffix}
        </span>
    );
};
