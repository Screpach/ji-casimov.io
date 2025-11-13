import React from "react";

const LicensePanel: React.FC = () => {
  return (
    <div className="license-panel card">
      <h2>License (Testing Only)</h2>
      <div className="license-scroll">
        <p><strong>Testing-Only, No-Copy Software License (CTOL v1.0)</strong></p>
        <p>Licensor: Eugeniu Casimov<br />Territory: Worldwide<br />Effective Date: January 2, 2025<br />Place of Issuance: Barcelona, Spain</p>

        <p><strong>Definitions</strong></p>
        <p>
          <strong>Software:</strong> The program, code, binaries, libraries, models, assets,
          documentation, interfaces, and any outputs, samples, or data sets provided by Licensor.
        </p>
        <p>
          <strong>Evaluate/Testing:</strong> Short-term internal trials to assess suitability,
          without any commercial, production, or external use.
        </p>

        <p><strong>License Grant (Evaluation Only)</strong></p>
        <p>
          Subject to strict compliance with this License, Licensor grants you a limited,
          non-exclusive, non-transferable, non-sublicensable, revocable right to install and
          run one instance of the Software solely for internal testing/evaluation. No other
          rights are granted.
        </p>

        <p><strong>Prohibitions (No Copy / No Reproduce / No Simulate / No Imitate)</strong></p>
        <p>You shall not, and shall not permit others to:</p>
        <ul>
          <li>
            Copy or reproduce the Software, in whole or part, except for one ephemeral,
            automatic memory copy strictly necessary for execution during evaluation (no
            retention or archiving).
          </li>
          <li>
            Distribute, disclose, sell, rent, lease, lend, host, SaaS, or otherwise provide access
            to any third party.
          </li>
          <li>
            Simulate or imitate the Software, including creating or training any code, model, or
            system intended to replicate features, behavior, architecture, look-and-feel, or
            performance of the Software, whether directly or using outputs, logs, traces,
            benchmarks, or APIs as reference.
          </li>
          <li>
            Reverse engineer, decompile, disassemble, derive source, or circumvent technical
            protections, except to the extent a non-waivable law expressly allows and then only
            after 30 days’ prior written notice to Licensor.
          </li>
          <li>
            Create derivative works, translations, ports, wrappers, adapters, or interface layers.
          </li>
          <li>Benchmark publicly or publish performance/feature comparisons.</li>
          <li>
            Use outputs (including generated data, schemas, traces, or prompts) to build, train,
            fine-tune, or enhance any product or model.
          </li>
          <li>
            Use in production, client-facing, safety-critical, or revenue-generating contexts.
          </li>
          <li>
            Remove or alter notices (copyright, watermarks, identifiers, or license text).
          </li>
        </ul>

        <p><strong>Ownership</strong></p>
        <p>
          The Software is licensed, not sold. All rights, title, and interest remain with
          Eugeniu Casimov. No implied licenses.
        </p>

        <p><strong>Feedback</strong></p>
        <p>
          Any feedback is voluntary; Licensor may use it freely without obligation.
        </p>

        <p><strong>Confidentiality</strong></p>
        <p>
          The Software and any non-public information about it are Confidential Information.
          You must protect it with at least reasonable care and use it only for evaluation.
        </p>

        <p><strong>Term &amp; Termination</strong></p>
        <p>
          This License starts on first access and continues until the earlier of: (a) 30 days from
          Effective Date, or (b) Licensor’s written revocation, or (c) your breach (which
          terminates immediately). Upon termination, you must stop all use and irreversibly delete
          the Software and all related data, reports, logs, traces, and outputs.
        </p>

        <p><strong>Audit</strong></p>
        <p>
          On reasonable notice, Licensor may verify compliance. You will provide records
          sufficient to demonstrate adherence to this License.
        </p>

        <p><strong>No Warranty</strong></p>
        <p>
          The Software is provided “AS IS” and “AS AVAILABLE,” without warranties of any kind
          (express, implied, or statutory), including merchantability, fitness, non-infringement,
          accuracy, or reliability.
        </p>

        <p><strong>Limitation of Liability</strong></p>
        <p>
          To the maximum extent permitted by law, Licensor shall not be liable for indirect,
          incidental, consequential, special, exemplary, or punitive damages, nor for lost
          profits, revenue, data, or goodwill. Licensor’s aggregate liability is limited to
          USD $100.
        </p>

        <p><strong>Injunctive Relief</strong></p>
        <p>
          Any breach of Sections 3, 6, or 7 may cause irreparable harm; Licensor is entitled to
          immediate injunctive relief in addition to other remedies.
        </p>

        <p><strong>Export &amp; Compliance</strong></p>
        <p>
          You must comply with all applicable export, sanctions, and technology control laws and
          may not use the Software if prohibited.
        </p>

        <p><strong>Governing Law &amp; Venue</strong></p>
        <p>
          This License is governed by the laws of Spain, without regard to conflict rules.
          Exclusive jurisdiction and venue lie in the courts of Barcelona, Spain. If local law
          grants you non-waivable reverse-engineering rights for interoperability, you must first
          request the needed information from Licensor and use any such rights only to the minimal
          extent mandated by law.
        </p>

        <p><strong>Entire Agreement; Order of Precedence</strong></p>
        <p>
          This is the entire agreement regarding evaluation of the Software. If there is a signed
          writing with different terms, that writing controls.
        </p>

        <p><strong>Severability; No Waiver; Assignment</strong></p>
        <p>
          If any provision is unenforceable, the rest remains effective. Failure to enforce is not
          a waiver. You may not assign this License without Licensor’s prior written consent; any
          attempted assignment is void.
        </p>

        <p>
          Licensor: Eugeniu Casimov<br />
          Date: January 2, 2025<br />
          Place: Barcelona, Spain
        </p>
      </div>
    </div>
  );
};

export default LicensePanel;
