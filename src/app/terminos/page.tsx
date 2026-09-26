import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones - Monad Tour Colombia",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-monad-dark py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-white/50 hover:text-white font-mono mb-8 transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Términos y Condiciones</h1>
        <p className="text-white/50 text-sm font-mono mb-12">Última actualización: Mayo 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al registrarte y participar en los eventos MonadBlitz Hackathon organizados como parte
              del Monad Tour Colombia, aceptas estos términos y condiciones en su totalidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Descripción del Evento</h2>
            <p>
              MonadBlitz Medellín es un hackathon de un día. La próxima edición es el 17 de octubre
              de 2026. Los participantes desarrollan proyectos blockchain durante el evento, con el
              apoyo de mentores y la evaluación de jurados seleccionados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Elegibilidad</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Debes ser mayor de 18 años para participar</li>
              <li>Debes proporcionar información veraz y completa al momento del registro</li>
              <li>
                Los organizadores se reservan el derecho de rechazar o cancelar registros a su
                discreción
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Código de Conducta</h2>
            <p>Todos los participantes deben:</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Comportarse de manera profesional y respetuosa</li>
              <li>No discriminar por género, raza, orientación sexual, religión o nacionalidad</li>
              <li>No participar en actividades ilegales o que pongan en riesgo la seguridad</li>
              <li>Respetar la propiedad intelectual de otros participantes</li>
              <li>Seguir las instrucciones de los organizadores</li>
            </ul>
            <p className="mt-3">
              El incumplimiento del código de conducta puede resultar en la expulsión del evento sin
              previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Propiedad Intelectual</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Los proyectos desarrollados durante el hackathon son propiedad de sus creadores
              </li>
              <li>
                Al participar, otorgas a los organizadores el derecho de mencionar y mostrar tu
                proyecto con fines promocionales
              </li>
              <li>El código open source debe respetar las licencias correspondientes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Premios</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Los premios se anunciarán antes de cada evento</li>
              <li>La decisión de los jurados es final e inapelable</li>
              <li>
                Los organizadores se reservan el derecho de modificar la estructura de premios
              </li>
              <li>
                Los ganadores son responsables de los impuestos aplicables sobre los premios
                recibidos
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Responsabilidad y Limitaciones</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>La participación en el evento es bajo tu propia responsabilidad</li>
              <li>
                Los organizadores no se hacen responsables por pérdida o daño de equipos personales
              </li>
              <li>Los organizadores no garantizan resultados específicos de la participación</li>
              <li>
                Los organizadores pueden cancelar o modificar el evento por fuerza mayor u otras
                circunstancias imprevistas
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Imagen y Contenido Multimedia</h2>
            <p>
              Al participar en el evento, autorizas a los organizadores a capturar y utilizar
              fotografías, videos y grabaciones de audio donde aparezcas, con fines promocionales y
              de documentación del evento, en redes sociales, sitio web y materiales de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              9. Cancelación por el Participante
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Puedes cancelar tu participación en cualquier momento antes del evento</li>
              <li>Te pedimos notificar con anticipación para abrir cupos a otros participantes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Modificaciones</h2>
            <p>
              Los organizadores se reservan el derecho de modificar estos términos y condiciones.
              Los cambios serán comunicados a través de los canales oficiales del evento y
              publicados en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa
              será resuelta ante los tribunales competentes de Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contacto</h2>
            <p>
              Para preguntas sobre estos términos y condiciones, puedes contactarnos a través de
              nuestras redes sociales oficiales o en los canales de Discord de Monad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
