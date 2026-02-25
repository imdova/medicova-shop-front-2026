"use client";

import Link from "next/link";
import Collapse from "@/components/features/Collapse";
import { Drawer } from "@/components/layouts/Drawer";
import LogoIcon from "@/assets/icons/logo";
import { linksHeader, link as linksSubHeader } from "@/types";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "en" | "ar";
  commonLinks: linksHeader[];
}

const MobileNavDrawer = ({
  isOpen,
  onClose,
  locale,
  commonLinks,
}: MobileNavDrawerProps) => {
  return (
    <Drawer
      logo={
        <Link className="block w-fit p-3" href="/" onClick={onClose}>
          <LogoIcon className="h-14 w-28 text-primary md:text-white" />
        </Link>
      }
      position="left"
      isOpen={isOpen}
      onClose={onClose}
      locale={locale}
    >
      <nav aria-label="Mobile navigation">
        <div className="flex flex-col p-2">
          {commonLinks.map((link: linksHeader, index: number) => (
            <div
              className="border-b border-gray-100 last-of-type:border-none"
              key={index}
            >
              {link.subLinks && link.subLinks.length > 0 && (
                <Collapse
                  url={link.url}
                  key={link.title[locale]}
                  title={link.title[locale]}
                >
                  <ul>
                    {link.subLinks?.map(
                      (subLink: linksSubHeader, subIndex: number) => (
                        <li
                          className="text-gray-600 transition hover:text-primary"
                          key={subIndex}
                        >
                          <Link
                            className="block p-1 text-xs"
                            href={subLink.url}
                            onClick={onClose}
                          >
                            {subLink.title[locale]}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </Collapse>
              )}
              {link.gridLinks && link.gridLinks.length > 0 && (
                <Collapse
                  url={link.url}
                  key={link.title[locale]}
                  title={link.title[locale]}
                >
                  <div>
                    <ul className="text-xs">
                      {link.gridLinks?.map(
                        (gridLink: any, gridIndex: number) => (
                          <Collapse
                            url={link.url}
                            title={gridLink.heading[locale]}
                            key={gridIndex}
                            size="sm"
                            fontSize="sm"
                          >
                            <li>
                              <ul>
                                {gridLink.subLinks?.map(
                                  (link: linksSubHeader, index: number) => (
                                    <li key={index}>
                                      <Link
                                        className="block p-2 text-xs text-gray-600 transition hover:text-primary"
                                        href={link.url}
                                        onClick={onClose}
                                      >
                                        {link.title[locale]}
                                      </Link>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </li>
                          </Collapse>
                        ),
                      )}
                    </ul>
                  </div>
                </Collapse>
              )}
              {!link.gridLinks && !link.subLinks && (
                <ul>
                  <li className="text-gray-600 transition hover:text-main">
                    <Link
                      className="block p-2 text-xs font-semibold text-gray-800"
                      href={link.url}
                      onClick={onClose}
                    >
                      {link.title[locale]}
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          ))}
        </div>
      </nav>
    </Drawer>
  );
};

export default MobileNavDrawer;
