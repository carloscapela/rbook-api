import styles from "./page.module.css";
import { BookMark } from "@/components/BookLogo";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <BookMark size={88} />
        <span className={styles.badge}>API em desenvolvimento</span>
        <h1 className={styles.title}>rbook</h1>
        <p className={styles.tagline}>
          Registre seus dias de leitura em um calendário visual, como um
          &ldquo;contribution graph&rdquo; do GitHub — mas para hábitos de
          leitura.
        </p>
        <p className={styles.description}>
          O objetivo é ajudar quem lê a criar consistência, visualizando o
          progresso ao longo do tempo: livros marcados dia a dia, sequências
          de leitura (streaks) e comparação entre meses e anos.
        </p>
        <ul className={styles.features}>
          <li>Acompanhe os livros que está lendo e já terminou</li>
          <li>Registre sessões de leitura por página e tempo</li>
          <li>Defina metas e acompanhe sua consistência</li>
        </ul>
        <div className={styles.links}>
          <a
            className={styles.linkPrimary}
            href="https://github.com/carloscapela/rbook-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver repositório
          </a>
          <a className={styles.linkSecondary} href="/docs">
            Documentação da API
          </a>
          <a className={styles.linkSecondary} href="/api/health">
            Status da API
          </a>
        </div>
      </div>
    </main>
  );
}
