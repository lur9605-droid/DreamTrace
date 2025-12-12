"use client"; 
 import React from "react"; 
 import styles from "./TextArea.module.css"; 
 
 interface Props { 
   value: string; 
   onChange: (v: string) => void; 
   placeholder?: string; 
   rows?: number; 
 } 
 
 export default function TextArea({ value, onChange, placeholder = "昨晚我梦见……", rows = 8 }: Props) { 
   return ( 
     <textarea 
       className={styles.textarea} 
       value={value} 
       onChange={(e) => onChange(e.target.value)} 
       placeholder={placeholder} 
       rows={rows} 
     /> 
   ); 
 }