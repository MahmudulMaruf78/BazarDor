BAZARDOR DOCUMENTATION PACKAGE v2.0
Generated: 04 November 2026

All business specification files live in this `documentations/` folder.

Files:
1. documentations/BazarDor_Project_Master_Plan_v2.0.docx
   Consolidated source of truth for scope, roles, business rules, architecture, data models,
   acceptance criteria, and open decisions.

2. documentations/BazarDor_Simple_Data_Flow_Diagram_v2.0.docx
   Plain-language customer/stakeholder explanation with a simple visual flow.

3. documentations/BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx
   Project setup commands, recommended structure, implementation sequence, eight phase guides,
   phase exit checks, testing scenarios, and deployment/handover notes.

4. .cursor/rules/bazardor-project.mdc
   Single always-applied Cursor project rule file.

5. Application code (Phase 1+)
   React + Vite + TypeScript under `src/`. Shared UI under `src/components/`.
   Run from repo root: npm install && npm run dev

Important:
- The project remains a frontend-only prototype.
- Open business decisions are explicitly listed in the Master Plan.
- Mock data, demo authentication, demo approvals, and demo transactions must not be presented
  as real government services or real financial transactions.
