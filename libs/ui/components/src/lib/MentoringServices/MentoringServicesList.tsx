import React from "react";
import { ArrowIconElement, CheckIconElement } from "@t4g/ui/icons";
import { DividerElement, LinkElement } from "@t4g/ui/elements";
import { MentoringServicesDetail } from "libs/ui/components/src/lib/MentoringServices/MentoringServicesDetail";
import { useAppContext } from "@t4g/ui/providers";
import { Components } from "@t4g/types";

/**
 * State Reducer
 */
type InitialState = {
  mentoringServices: string[];
};
const initialState: InitialState = {
  mentoringServices: [],
};

function reducer(
  state: {
    mentoringServices: string[];
  },
  action: {
    type: "UPDATE_SERVICE_PREFERENCES";
    payload: {
      mentoringServices: string[];
    };
  }
) {
  switch (action.type) {
    case "UPDATE_SERVICE_PREFERENCES":
      return {
        ...state,
        service: action.payload,
      };
  }
}

export const MentoringServicesList: React.FC<Components.Services.ServicesList.Props> =
  function ({
    title,
    mentoringServices,
    serviceCategory,
    serviceId,
    setList,
  }: Components.Services.ServicesList.Props) {
    const { setRightPanel } = useAppContext();
    const [state, dispatch] = React.useReducer<any>(reducer, {
      ...initialState,
      service: {
        id: serviceId,
      },
    });

    // React.useEffect(() => {
    //   const list = annotations.filter((annotation) =>
    //     (state as InitialState).service.annotations?.includes(annotation.id)
    //   );
    //   setList && setList(list);
    // }, [state]);

    return (
      <div className="ServicesList text-blue-005   p-4 mb-6 bg-white border-2 border-transparent">
        <div className="ServicesList__Header flex items-center justify-between">
          <h3 className="text-h3 text-blue-005 font-medium">{title}</h3>
          <div
            className={`ServicesList__Label flex items-center border px-4 py-1.5 rounded-full font-medium text-base ${
              mentoringServices.length > 0
                ? "text-green-001 bg-green-005 border-green-001"
                : "border-blue-008 text-blue-008 text-base"
            }`}
          >
            {mentoringServices.length > 0 ? (
              <span>Active</span>
            ) : (
              <span>Not Active</span>
            )}
          </div>
        </div>
        <div className="ServicesList__List flex mt-6">
          {mentoringServices.length > 0 && (
            <div className="text-blue-007 text-base font-medium">
              People can reach out to you for:
            </div>
          )}
          <ul role="list" className="flex flex-col ml-8 -mt-0.5 text-blue-005">
            {mentoringServices.map((service: any) => (
              <li key={service.id} className="ServicesList__Service mb-2.5">
                <div className="flex items-center">
                  <div className="w-4 h-4 -mt-1">
                    <CheckIconElement size="small" />
                  </div>
                  <p className="ml-2">{service.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DividerElement spacing="py-4" bleeding />
        <div className="flex justify-end">
          {/*{annotations.length > 0 ? (*/}
          {/*  <div*/}
          {/*    className="flex items-center"*/}
          {/*    // onClick={() =>*/}
          {/*    //   setRightPanel({*/}
          {/*    //     component: (*/}
          {/*    //       <ServicesDetail*/}
          {/*    //         title={title}*/}
          {/*    //         serviceId={serviceId}*/}
          {/*    //         serviceCategory={serviceCategory}*/}
          {/*    //         annotations={annotations.map((annotation) => ({*/}
          {/*    //           ...annotation,*/}
          {/*    //           isSelected: (*/}
          {/*    //             state as InitialState*/}
          {/*    //           ).service.annotations?.includes(annotation.id),*/}
          {/*    //         }))}*/}
          {/*    //         dispatch={dispatch}*/}
          {/*    //       />*/}
          {/*    //     ),*/}
          {/*    //   })*/}
          {/*    // }*/}
          {/*  >*/}
          {/*    <LinkElement href="#">*/}
          {/*      {annotations.length > 0*/}
          {/*        ? list.length > 0*/}
          {/*          ? 'Edit service'*/}
          {/*          : 'Activate service'*/}
          {/*        : 'Coming soon'}*/}
          {/*    </LinkElement>*/}
          {/*    <span className="ml-2">*/}
          {/*      <ArrowIconElement size="small" />*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*) : (*/}
          {/*  <div className="flex items-center">*/}
          {/*    <LinkElement href="#">*/}
          {/*      {annotations.length > 0*/}
          {/*        ? list.length > 0*/}
          {/*          ? 'Edit service'*/}
          {/*          : 'Activate service'*/}
          {/*        : 'Coming soon'}*/}
          {/*    </LinkElement>*/}
          {/*    <span className="ml-2">*/}
          {/*      <ArrowIconElement size="small" />*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </div>
    );
  };
