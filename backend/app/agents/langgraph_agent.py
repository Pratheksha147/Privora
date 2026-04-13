from typing import TypedDict
import pandas as pd

from langgraph.graph import StateGraph, END

from app.agents.nodes import (
    data_agent,
    privacy_agent,
    insight_agent,
    proof_agent
)


# Define State
class AgentState(TypedDict):
    dataframe: pd.DataFrame
    summary: dict
    privacy: dict
    insights: str
    proof: str
    proofStatus: str


# Build Graph
def build_graph():

    graph = StateGraph(AgentState)

    # Add Nodes
    graph.add_node("data", data_agent)
    graph.add_node("privacy", privacy_agent)
    graph.add_node("insight", insight_agent)
    graph.add_node("proof", proof_agent)

    # Define Flow
    graph.set_entry_point("data")

    graph.add_edge("data", "privacy")
    graph.add_edge("privacy", "insight")
    graph.add_edge("insight", "proof")

    graph.add_edge("proof", END)

    return graph.compile()


# Run Agent
def run_langgraph(df: pd.DataFrame):

    graph = build_graph()

    state = {
        "dataframe": df
    }

    result = graph.invoke(state)

    return result