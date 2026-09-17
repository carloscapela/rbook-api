"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import styles from "./page.module.css";
import { BookMark } from "@/components/BookLogo";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <>
      <header className={styles.header}>
        <BookMark size={32} />
        <span className="wordmark">rbook API docs</span>
      </header>
      <div className={styles.swaggerRoot}>
        <SwaggerUI url="/api/doc" />
      </div>
    </>
  );
}
