"use client"; 
 import React from "react"; 
import styles from "./page.module.css"; 
import ChatInterface from "@/components/ChatInterface";
import { useRouter } from "next/navigation";

export default function AnalysisPage() { 
  const router = useRouter();
  
  return ( 
    <div className={styles.container}> 
      <ChatInterface onBack={() => router.push('/')} />
    </div> 
  ); 
}