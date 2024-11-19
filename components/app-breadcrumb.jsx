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

            const isAdminRoute = parts[0] === 'admin';
            const relevantParts = isAdminRoute ? parts.slice(1) : parts;
            const isAdminOnly = isAdminRoute && relevantParts.length === 0;

            let breadcrumbItems = [];

            // Add Admin item if it's an admin route
            if (isAdminRoute) {
                breadcrumbItems.push(
                    <BreadcrumbItem key="admin">
                        {isAdminOnly && <BreadcrumbPage>Admin</BreadcrumbPage>}
                        {!isAdminOnly && <BreadcrumbLink href='/admin'>Admin</BreadcrumbLink>}
                        {!isAdminOnly && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                );
            }

            // Add the rest of the breadcrumb items
            const restItems = relevantParts.map((part, index) => {
                const isLast = index === relevantParts.length - 1;
                let name;

                if (index === 0) {
                    name = baseRoutes[part] || formatText(part);
                } else if (index === 1) {
                    const baseText = relevantParts[0].charAt(0).toUpperCase() +
                        relevantParts[0].slice(1).toLowerCase().replace(/s$/, '');
                    name = `${formatText(part, true)} ${baseText}`;
                } else {
                    name = formatText(part);
                }

                // Construct URL with admin prefix if it exists
                const urlParts = isAdminRoute 
                    ? ['/admin', ...relevantParts.slice(0, index + 1)]
                    : ['/', ...relevantParts.slice(0, index + 1)];
                const url = urlParts.join('/');

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

            setBreadcrumbs([...breadcrumbItems, ...restItems]);

            const baseRoute = relevantParts[0];
            const action = relevantParts[1];
            const baseText = baseRoute ? formatText(baseRoute) : '';
            const actionText = action ? formatText(action, true) : '';
            const titleText = actionText ? `${actionText} ${baseText}` : baseText;
            document.title = `Inventory${titleText ? " | " + titleText : ""}`;
        };

        generateBreadcrumbs(pathname);
    }, [pathname]);

    return (
        <header className={`flex shrink-0 items-center ${className}`} {...props}>
            <div className="flex justify-between flex-1 items-center gap-1 px-2 lg:px-4">
                <div className="flex items-center gap-3 lg:gap-4">
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