import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Layout, { ProfileLayout } from "../../components/Layout";
import Card from "../../components/Card";

// import { Database } from "../../utils/database.types"; // Use this for later when we are drawing from the Planets table
// type Planets = Database['public']['Tables']['planets']['Row'];