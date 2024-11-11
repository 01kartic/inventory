'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbLink } from './ui/breadcrumb';
import { SidebarTrigger } from './ui/sidebar';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ui/theme';

const AppBreadcrumb = ({ className, ...props }) => {
    const pathname = usePathname();
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const formatText = (part, isAction = false) => {
        if (isAction) {
            switch (part) {
                case 'add':
                    return 'Add';
                case 'edit':
                    return 'Edit';
                default:
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
        }

        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase().replace(/s$/, '');
    };

    useEffect(() => {
        const generateBreadcrumbs = (pathname) => {
            const parts = pathname.split('/').filter(Boolean);
            const baseRoutes = {
                customers: 'Customers',
                products: 'Products',
                stocks: 'Stocks'
            };

            const breadcrumbItems = parts.map((part, index) => {
                const isLast = index === parts.length - 1;
                let name;

                if (index === 0) {
                    name = baseRoutes[part] || formatText(part);
                } else if (index === 1) {
                    const baseText = parts[0].charAt(0).toUpperCase() +
                        parts[0].slice(1).toLowerCase().replace(/s$/, '');
                    name = `${formatText(part, true)} ${baseText}`;
                } else {
                    name = formatText(part);
                }

                const url = '/' + parts.slice(0, index + 1).join('/');

                return (
                    <BreadcrumbItem key={url}>
                        {isLast ? (
                            <BreadcrumbPage>{name}</BreadcrumbPage>
                        ) : (
                            <>
                                <BreadcrumbLink href={url}>{name}</BreadcrumbLink>
                                <BreadcrumbSeparator />
                            </>
                        )}
                    </BreadcrumbItem>
                );
            });

            setBreadcrumbs(breadcrumbs => breadcrumbItems);

            const baseRoute = parts[0];
            const action = parts[1];
            const baseText = baseRoute ? formatText(baseRoute) : '';
            const actionText = action ? formatText(action, true) : '';
            const titleText = actionText ? `${actionText} ${baseText}` : baseText;
            document.title = `Inventory${titleText ? " | " + titleText : ""}`;
        };

        generateBreadcrumbs(pathname);
    }, [pathname]);

    return (
        <header className={`flex h-14 shrink-0 items-center ${className}`} {...props}>
            <div className="flex justify-between flex-1 items-center gap-4 px-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    {breadcrumbs.length > 0 && (
                        <Separator orientation="vertical" className="h-4" />
                    )}
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default AppBreadcrumb;
