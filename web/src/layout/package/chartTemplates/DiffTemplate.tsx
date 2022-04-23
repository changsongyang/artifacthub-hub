import 'react-diff-view/style/index.css';

import { isNull } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { Decoration, Diff, Hunk, parseDiff } from 'react-diff-view';

import { CompareChartTemplate, CompareChartTemplateStatus } from '../../../types';
import styles from './DiffTemplate.module.css';

const DiffLibrary = require('diff');

interface Props {
  currentVersion: string;
  diffVersion: string;
  template: CompareChartTemplate;
  expanded: boolean;
  setIsChangingTemplate: Dispatch<SetStateAction<boolean>>;
}

interface DiffProps {
  diffText: string;
  fileName: string;
  status?: CompareChartTemplateStatus;
  removeLoading: () => void;
}

const Changes = (props: DiffProps) => {
  const tmplWrapper = useRef<HTMLDivElement>(null);
  const files = parseDiff(props.diffText);

  const scrollTop = () => {
    if (tmplWrapper && tmplWrapper.current) {
      tmplWrapper.current.scroll(0, 0);
    }
  };

  const renderFile = ({
    oldPath,
    newPath,
    oldRevision,
    newRevision,
    type,
    hunks,
    oldEndingNewLine,
    newEndingNewLine,
  }: any) => {
    return (
      <div key={`${oldRevision}-${newRevision}`} className="file-diff h-100">
        <header className="d-flex flex-row align-items-center justify-content-between diff-header fw-bold mb-2 pt-1 pb-2">
          <div className="text-truncate">{props.fileName}</div>
          <div className="pe-5 me-3 ps-3">
            <small className="pe-2">Changes from</small>
            <span className="badge bg-dark px-2 py-1 badge-md">{oldPath}</span>
            <small className="px-2">to</small>
            <span className="badge bg-dark px-2 py-1 badge-md">{newPath}</span>
          </div>
        </header>
        <div ref={tmplWrapper} className={`overflow-scroll border-top ${styles.codeWrapper}`}>
          <Diff viewType="unified" diffType={type} hunks={hunks}>
            {(hunks: any[]) =>
              hunks.map((hunk, index) => {
                return [
                  <Decoration key={`deco-${hunk.content}-${index}`}>
                    <div className={`hunk-header py-1 my-2 px-3 fw-bold ${styles.hunkHeader}`}>{hunk.content}</div>
                  </Decoration>,
                  <Hunk key={`${hunk.content}-${index}`} hunk={hunk} />,
                  <>
                    {index + 1 === hunks.length &&
                      !oldEndingNewLine &&
                      props.status !== CompareChartTemplateStatus.Deleted && (
                        <tbody key={`${hunk.content}-newLine-${index}`}>
                          <tr>
                            <td></td>
                            <td></td>
                            <td className={styles.newLine}>\ No newline at end of file</td>
                          </tr>
                        </tbody>
                      )}
                  </>,
                ];
              })
            }
          </Diff>
        </div>
      </div>
    );
  };

  useEffect(() => {
    props.removeLoading();
    scrollTop();
  }, [props.diffText]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return <>{files.map(renderFile)}</>;
};

const DiffTemplate = (props: Props) => {
  const [diffContent, setDiffContent] = useState<string | null>(null);

  const removeLoading = useCallback(() => {
    props.setIsChangingTemplate(false);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    const prepareDiff = () => {
      setDiffContent(
        DiffLibrary.createTwoFilesPatch(
          '  ',
          '  ',
          props.template.data,
          props.template.compareData,
          props.diffVersion,
          props.currentVersion,
          { context: props.expanded ? Number.MAX_SAFE_INTEGER : 2 }
        )
      );
    };

    prepareDiff();
  }, [props.template, props.expanded]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <>
      {!isNull(diffContent) && (
        <Changes
          diffText={`diff --git \n ${diffContent}`}
          fileName={props.template.name}
          status={props.template.status}
          removeLoading={removeLoading}
        />
      )}
    </>
  );
};

export default DiffTemplate;
